package com.integrador.marweld.auth.application.usecase;

import com.integrador.marweld.auth.application.command.*;
import com.integrador.marweld.auth.application.port.EmailSender;
import com.integrador.marweld.auth.application.result.*;
import com.integrador.marweld.auth.domain.exception.*;
import com.integrador.marweld.auth.domain.model.*;
import com.integrador.marweld.auth.infrastructure.persistence.repository.*;
import com.integrador.marweld.auth.infrastructure.security.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.*;

@Component
public class AuthSessionUseCaseHandler implements AuthSessionUseCase {
    private static final SecureRandom RANDOM = new SecureRandom();
    private static final int CHALLENGE_TTL_MINUTES = 5;
    private static final int EMAIL_CODE_TTL_MINUTES = 5;

    private final UsuarioRepository usuarioRepository;
    private final ClienteRepository clienteRepository;
    private final UsuarioMfaMetodoRepository metodoRepository;
    private final UsuarioMfaTotpRepository totpRepository;
    private final CodigoMfaEmailRepository codigoRepository;
    private final DesafioMfaRepository desafioRepository;
    private final SesionUsuarioRepository sesionRepository;
    private final RefreshTokenRepository refreshRepository;
    private final PasswordEncoder passwordEncoder;
    private final OtpService otpService;
    private final TotpSecretCipher totpSecretCipher;
    private final RefreshTokenCodec refreshTokenCodec;
    private final AsymmetricJwtService jwtService;
    private final EmailSender emailSender;
    private final long refreshTtlDays;

    public AuthSessionUseCaseHandler(
            UsuarioRepository usuarioRepository, ClienteRepository clienteRepository,
            UsuarioMfaMetodoRepository metodoRepository, UsuarioMfaTotpRepository totpRepository,
            CodigoMfaEmailRepository codigoRepository, DesafioMfaRepository desafioRepository,
            SesionUsuarioRepository sesionRepository, RefreshTokenRepository refreshRepository,
            PasswordEncoder passwordEncoder, OtpService otpService, TotpSecretCipher totpSecretCipher,
            RefreshTokenCodec refreshTokenCodec, AsymmetricJwtService jwtService, EmailSender emailSender,
            @Value("${app.security.refresh-token.ttl-days:30}") long refreshTtlDays) {
        this.usuarioRepository = usuarioRepository;
        this.clienteRepository = clienteRepository;
        this.metodoRepository = metodoRepository;
        this.totpRepository = totpRepository;
        this.codigoRepository = codigoRepository;
        this.desafioRepository = desafioRepository;
        this.sesionRepository = sesionRepository;
        this.refreshRepository = refreshRepository;
        this.passwordEncoder = passwordEncoder;
        this.otpService = otpService;
        this.totpSecretCipher = totpSecretCipher;
        this.refreshTokenCodec = refreshTokenCodec;
        this.jwtService = jwtService;
        this.emailSender = emailSender;
        this.refreshTtlDays = refreshTtlDays;
    }

    @Override
    public AuthFlowResult login(LoginCommand command) {
        Usuario usuario = usuarioRepository.findByCorreo(normalizeEmail(command.correo()))
                .orElseThrow(InvalidCredentialsException::new);
        if (!passwordEncoder.matches(command.contrasena(), usuario.getContrasena())) {
            throw new InvalidCredentialsException();
        }
        validateAccount(usuario);

        List<MetodoMfa> methods = metodoRepository.findByUsuario(usuario).stream()
                .filter(method -> method.getEstado() == EstadoMfaMetodo.ACTIVO)
                .map(UsuarioMfaMetodo::getMetodo)
                .sorted(Comparator.comparingInt(method -> method == MetodoMfa.TOTP ? 0 : 1))
                .toList();
        if (!methods.isEmpty()) {
            DesafioMfa challenge = desafioRepository.save(
                    new DesafioMfa(usuario, LocalDateTime.now().plusMinutes(CHALLENGE_TTL_MINUTES)));
            List<String> available = methods.stream().map(Enum::name).toList();
            return AuthFlowResult.mfaRequired(new MfaChallengeResult(
                    challenge.getPublicId(), challenge.getFechaExpiracion(), available, available.getFirst()));
        }
        return issueSession(usuario, command.ip(), command.userAgent());
    }

    @Override
    public MfaEmailSentResult sendLoginMfaEmail(MfaChallengeCommand command) {
        DesafioMfa challenge = desafioRepository.findByPublicId(command.challengePublicId())
                .orElseThrow(InvalidMfaChallengeException::new);
        if (challenge.getEstado() == EstadoDesafioMfa.BLOQUEADO) {
            throw new TooManyMfaAttemptsException();
        }
        if (!challenge.disponible(LocalDateTime.now())) {
            desafioRepository.save(challenge);
            throw new InvalidMfaChallengeException();
        }
        Usuario usuario = challenge.getUsuario();
        requireActiveMethod(usuario, MetodoMfa.EMAIL_OTP);

        checkMfaRateLimit(usuario);

        List<CodigoMfaEmail> pending = codigoRepository.findByUsuarioAndPropositoAndEstado(
                usuario, PropositoCodigoMfa.LOGIN, EstadoCodigoMfa.PENDIENTE);
        pending.forEach(CodigoMfaEmail::expirar);
        codigoRepository.saveAll(pending);

        String otp = String.format("%06d", RANDOM.nextInt(1_000_000));
        LocalDateTime expiration = LocalDateTime.now().plusMinutes(EMAIL_CODE_TTL_MINUTES);
        codigoRepository.save(new CodigoMfaEmail(usuario, challenge, passwordEncoder.encode(otp),
                PropositoCodigoMfa.LOGIN, expiration));
        emailSender.sendMfaEmailOtp(usuario.getCorreo(), usuario.getNombre(), otp);
        return new MfaEmailSentResult(expiration);
    }

    @Override
    public AuthFlowResult verifyLoginMfa(VerifyLoginMfaCommand command) {
        DesafioMfa challenge = desafioRepository.findByPublicId(command.challengePublicId())
                .orElseThrow(InvalidMfaChallengeException::new);

        if (challenge.getEstado() == EstadoDesafioMfa.BLOQUEADO) {
            throw new TooManyMfaAttemptsException();
        }
        if (!challenge.disponible(LocalDateTime.now())) {
            desafioRepository.save(challenge);
            if (challenge.getEstado() == EstadoDesafioMfa.EXPIRADO) {
                throw new MfaCodeExpiredException();
            }
            throw new InvalidMfaChallengeException();
        }

        Usuario usuario = challenge.getUsuario();
        requireActiveMethod(usuario, command.method());

        try {
            boolean valid = switch (command.method()) {
                case TOTP -> {
                    boolean ok = verifyTotp(usuario, command.codigo());
                    if (!ok) throw new MfaCodeIncorrectException();
                    yield ok;
                }
                case EMAIL_OTP -> verifyEmailOtp(challenge, command.codigo());
            };
        } catch (MfaCodeIncorrectException ex) {
            challenge.registrarFallo();
            desafioRepository.save(challenge);
            if (challenge.getEstado() == EstadoDesafioMfa.BLOQUEADO) {
                throw new TooManyMfaAttemptsException();
            }
            throw ex;
        }

        challenge.consumir();
        desafioRepository.save(challenge);
        return issueSession(usuario, command.ip(), command.userAgent());
    }

    @Override
    public AuthFlowResult refresh(RefreshSessionCommand command) {
        if (command.refreshToken() == null || command.refreshToken().isBlank()) {
            throw new InvalidRefreshTokenException();
        }
        RefreshToken current = refreshRepository.findByTokenHash(refreshTokenCodec.hash(command.refreshToken()))
                .orElseThrow(InvalidRefreshTokenException::new);
        if (!current.estaVigente(LocalDateTime.now())) {
            if (current.getSesion().getEstado() == EstadoSesionUsuario.ACTIVA) current.getSesion().cerrar();
            throw new InvalidRefreshTokenException();
        }
        current.revocar();
        current.getSesion().registrarUso();
        refreshRepository.save(current);
        sesionRepository.save(current.getSesion());
        return rotateSession(current.getSesion());
    }

    @Override
    public void logout(LogoutCommand command) {
        if (command.refreshToken() == null || command.refreshToken().isBlank()) return;
        refreshRepository.findByTokenHash(refreshTokenCodec.hash(command.refreshToken())).ifPresent(token -> {
            token.revocar();
            token.getSesion().cerrar();
            refreshRepository.save(token);
            sesionRepository.save(token.getSesion());
        });
    }

    private AuthFlowResult issueSession(Usuario usuario, String ip, String userAgent) {
        SesionUsuario session = sesionRepository.save(new SesionUsuario(usuario, ip, userAgent));
        return createAuthenticatedResult(session);
    }

    private AuthFlowResult rotateSession(SesionUsuario session) {
        return createAuthenticatedResult(session);
    }

    private AuthFlowResult createAuthenticatedResult(SesionUsuario session) {
        Usuario usuario = session.getUsuario();
        String rawRefreshToken = refreshTokenCodec.generate();
        refreshRepository.save(new RefreshToken(session, refreshTokenCodec.hash(rawRefreshToken),
                LocalDateTime.now().plusDays(refreshTtlDays)));
        Map<String, Object> claims = Map.of(
                "sid", session.getPublicId().toString(),
                "email", usuario.getCorreo(),
                "role", usuario.getRol().getNombreRol());
        String accessToken = jwtService.generateToken(usuario.getPublicId().toString(), claims);
        UUID clientPublicId = clienteRepository.findByUsuario(usuario).map(Cliente::getPublicId).orElse(null);
        AuthenticatedUserResult user = new AuthenticatedUserResult(usuario.getPublicId(), clientPublicId,
                usuario.getNombre(), usuario.getCorreo(), usuario.getRol().getNombreRol());
        return new AuthFlowResult("AUTHENTICATED", accessToken, jwtService.getExpirationSeconds(),
                user, null, rawRefreshToken);
    }

    private DesafioMfa loadAvailableChallenge(UUID publicId) {
        DesafioMfa challenge = desafioRepository.findByPublicId(publicId)
                .orElseThrow(InvalidMfaChallengeException::new);
        if (!challenge.disponible(LocalDateTime.now())) {
            desafioRepository.save(challenge);
            throw new InvalidMfaChallengeException();
        }
        return challenge;
    }

    private boolean verifyTotp(Usuario usuario, String code) {
        UsuarioMfaMetodo method = requireActiveMethod(usuario, MetodoMfa.TOTP);
        UsuarioMfaTotp totp = totpRepository.findByMetodo(method)
                .orElseThrow(InvalidMfaChallengeException::new);
        return otpService.verifyCode(totpSecretCipher.decrypt(totp.getSecretoCifrado()), code);
    }

    private boolean verifyEmailOtp(DesafioMfa challenge, String code) {
        Optional<CodigoMfaEmail> optional = codigoRepository
                .findFirstByDesafioAndEstadoOrderByFechaExpiracionDesc(challenge, EstadoCodigoMfa.PENDIENTE);
        if (optional.isEmpty()) {
            throw new MfaCodeIncorrectException();
        }
        CodigoMfaEmail emailCode = optional.get();
        if (emailCode.estaExpirado(LocalDateTime.now())) {
            emailCode.expirar();
            codigoRepository.save(emailCode);
            throw new MfaCodeExpiredException();
        }
        if (!passwordEncoder.matches(code, emailCode.getCodigoHash())) {
            throw new MfaCodeIncorrectException();
        }
        emailCode.utilizar();
        codigoRepository.save(emailCode);
        return true;
    }

    private void checkMfaRateLimit(Usuario usuario) {
        LocalDateTime now = LocalDateTime.now();

        Optional<CodigoMfaEmail> lastOtpOpt = codigoRepository.findFirstByUsuarioOrderByFechaCreacionDesc(usuario);
        if (lastOtpOpt.isPresent()) {
            CodigoMfaEmail lastOtp = lastOtpOpt.get();
            if (lastOtp.getFechaCreacion().plusSeconds(60).isAfter(now)) {
                throw new MfaRateLimitExceededException("Espera 60 segundos antes de solicitar otro código");
            }
        }

        LocalDateTime fifteenMinutesAgo = now.minusMinutes(15);
        long recentCount = codigoRepository.countByUsuarioAndFechaCreacionAfter(usuario, fifteenMinutesAgo);
        if (recentCount >= 3) {
            throw new MfaRateLimitExceededException("Demasiados intentos, intenta más tarde");
        }
    }

    private UsuarioMfaMetodo requireActiveMethod(Usuario usuario, MetodoMfa method) {
        return metodoRepository.findByUsuarioAndMetodo(usuario, method)
                .filter(item -> item.getEstado() == EstadoMfaMetodo.ACTIVO)
                .orElseThrow(InvalidMfaChallengeException::new);
    }

    private static void validateAccount(Usuario usuario) {
        if (usuario.getEstado() == EstadoUsuario.PENDIENTE_VERIFICACION_CORREO) {
            throw new EmailNotVerifiedException();
        }
        if (usuario.getEstado() != EstadoUsuario.ACTIVO) throw new AccountInactiveException();
    }

    private static String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase();
    }
}
