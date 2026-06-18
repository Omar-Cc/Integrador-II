package com.integrador.marweld.auth.application.usecase;

import com.integrador.marweld.auth.application.command.ConfirmMfaCodeCommand;
import com.integrador.marweld.auth.application.command.MfaAuthenticatedCommand;
import com.integrador.marweld.auth.application.port.EmailSender;
import com.integrador.marweld.auth.application.result.EmailMfaSetupResult;
import com.integrador.marweld.auth.application.result.MfaMethodResult;
import com.integrador.marweld.auth.application.result.MfaStatusResult;
import com.integrador.marweld.auth.application.result.TotpSetupResult;
import com.integrador.marweld.auth.domain.exception.EmailNotVerifiedException;
import com.integrador.marweld.auth.domain.exception.InvalidMfaCodeException;
import com.integrador.marweld.auth.domain.exception.MfaCodeExpiredException;
import com.integrador.marweld.auth.domain.exception.MfaEnrollmentNotFoundException;
import com.integrador.marweld.auth.domain.exception.MfaMethodAlreadyEnabledException;
import com.integrador.marweld.auth.domain.exception.UserNotFoundException;
import com.integrador.marweld.auth.domain.model.CodigoMfaEmail;
import com.integrador.marweld.auth.domain.model.EstadoCodigoMfa;
import com.integrador.marweld.auth.domain.model.EstadoMfaMetodo;
import com.integrador.marweld.auth.domain.model.EstadoUsuario;
import com.integrador.marweld.auth.domain.model.MetodoMfa;
import com.integrador.marweld.auth.domain.model.PropositoCodigoMfa;
import com.integrador.marweld.auth.domain.model.Usuario;
import com.integrador.marweld.auth.domain.model.UsuarioMfaMetodo;
import com.integrador.marweld.auth.domain.model.UsuarioMfaTotp;
import com.integrador.marweld.auth.infrastructure.persistence.repository.CodigoMfaEmailRepository;
import com.integrador.marweld.auth.infrastructure.persistence.repository.UsuarioMfaMetodoRepository;
import com.integrador.marweld.auth.infrastructure.persistence.repository.UsuarioMfaTotpRepository;
import com.integrador.marweld.auth.infrastructure.persistence.repository.UsuarioRepository;
import com.integrador.marweld.auth.infrastructure.security.OtpService;
import com.integrador.marweld.auth.infrastructure.security.QrCodeService;
import com.integrador.marweld.auth.infrastructure.security.TotpSecretCipher;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;

@Component
public class MfaEnrollmentUseCaseHandler implements GetMfaStatusUseCase,
        StartTotpSetupUseCase,
        ConfirmTotpSetupUseCase,
        StartEmailMfaSetupUseCase,
        ConfirmEmailMfaSetupUseCase {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private static final int EMAIL_OTP_TTL_MINUTES = 10;

    private final UsuarioRepository usuarioRepository;
    private final UsuarioMfaMetodoRepository metodoRepository;
    private final UsuarioMfaTotpRepository totpRepository;
    private final CodigoMfaEmailRepository codigoMfaEmailRepository;
    private final OtpService otpService;
    private final QrCodeService qrCodeService;
    private final TotpSecretCipher totpSecretCipher;
    private final PasswordEncoder passwordEncoder;
    private final EmailSender emailSender;

    public MfaEnrollmentUseCaseHandler(
            UsuarioRepository usuarioRepository,
            UsuarioMfaMetodoRepository metodoRepository,
            UsuarioMfaTotpRepository totpRepository,
            CodigoMfaEmailRepository codigoMfaEmailRepository,
            OtpService otpService,
            QrCodeService qrCodeService,
            TotpSecretCipher totpSecretCipher,
            PasswordEncoder passwordEncoder,
            EmailSender emailSender) {
        this.usuarioRepository = usuarioRepository;
        this.metodoRepository = metodoRepository;
        this.totpRepository = totpRepository;
        this.codigoMfaEmailRepository = codigoMfaEmailRepository;
        this.otpService = otpService;
        this.qrCodeService = qrCodeService;
        this.totpSecretCipher = totpSecretCipher;
        this.passwordEncoder = passwordEncoder;
        this.emailSender = emailSender;
    }

    @Override
    public MfaStatusResult getMfaStatus(MfaAuthenticatedCommand command) {
        Usuario usuario = loadActiveUser(command.correo());
        boolean totpEnabled = metodoRepository.existsByUsuarioAndMetodoAndEstado(usuario, MetodoMfa.TOTP, EstadoMfaMetodo.ACTIVO);
        boolean emailOtpEnabled = metodoRepository.existsByUsuarioAndMetodoAndEstado(usuario, MetodoMfa.EMAIL_OTP, EstadoMfaMetodo.ACTIVO);
        return new MfaStatusResult(totpEnabled, emailOtpEnabled);
    }

    @Override
    public TotpSetupResult startTotpSetup(MfaAuthenticatedCommand command) {
        Usuario usuario = loadActiveUser(command.correo());
        UsuarioMfaMetodo metodo = createOrResetPendingMethod(usuario, MetodoMfa.TOTP);
        String secret = otpService.generateSecret();
        String encryptedSecret = totpSecretCipher.encrypt(secret);
        UsuarioMfaTotp totp = totpRepository.findByMetodo(metodo)
                .orElseGet(() -> new UsuarioMfaTotp(metodo, encryptedSecret));
        totp.actualizarSecreto(encryptedSecret);
        totpRepository.save(totp);

        String otpauthUri = otpService.getOtpauthUri(secret, usuario.getCorreo(), "Marweld");
        String qrCodeDataUrl = toDataUrl(qrCodeService.generateQrCode(otpauthUri, 300, 300));
        return new TotpSetupResult(otpauthUri, qrCodeDataUrl, metodo.getEstado().name());
    }

    @Override
    public MfaMethodResult confirmTotpSetup(ConfirmMfaCodeCommand command) {
        Usuario usuario = loadActiveUser(command.correo());
        UsuarioMfaMetodo metodo = metodoRepository.findByUsuarioAndMetodo(usuario, MetodoMfa.TOTP)
                .filter(item -> item.getEstado() == EstadoMfaMetodo.PENDIENTE)
                .orElseThrow(MfaEnrollmentNotFoundException::new);
        UsuarioMfaTotp totp = totpRepository.findByMetodo(metodo)
                .orElseThrow(MfaEnrollmentNotFoundException::new);

        String secret = totpSecretCipher.decrypt(totp.getSecretoCifrado());
        if (!otpService.verifyCode(secret, command.codigo())) {
            throw new InvalidMfaCodeException();
        }

        metodo.activar();
        metodoRepository.save(metodo);
        return new MfaMethodResult(MetodoMfa.TOTP.name(), metodo.getEstado().name());
    }

    @Override
    public EmailMfaSetupResult startEmailMfaSetup(MfaAuthenticatedCommand command) {
        Usuario usuario = loadActiveUser(command.correo());
        UsuarioMfaMetodo metodo = createOrResetPendingMethod(usuario, MetodoMfa.EMAIL_OTP);
        expirePendingEmailCodes(usuario);

        String otp = generateOtp();
        LocalDateTime expiration = LocalDateTime.now().plusMinutes(EMAIL_OTP_TTL_MINUTES);
        CodigoMfaEmail codigo = new CodigoMfaEmail(
                usuario,
                passwordEncoder.encode(otp),
                PropositoCodigoMfa.ENROLLMENT,
                expiration
        );
        codigoMfaEmailRepository.save(codigo);
        emailSender.sendMfaEmailOtp(usuario.getCorreo(), usuario.getNombre(), otp);
        return new EmailMfaSetupResult(MetodoMfa.EMAIL_OTP.name(), metodo.getEstado().name(), expiration);
    }

    @Override
    public MfaMethodResult confirmEmailMfaSetup(ConfirmMfaCodeCommand command) {
        Usuario usuario = loadActiveUser(command.correo());
        UsuarioMfaMetodo metodo = metodoRepository.findByUsuarioAndMetodo(usuario, MetodoMfa.EMAIL_OTP)
                .filter(item -> item.getEstado() == EstadoMfaMetodo.PENDIENTE)
                .orElseThrow(MfaEnrollmentNotFoundException::new);
        CodigoMfaEmail codigo = codigoMfaEmailRepository
                .findFirstByUsuarioAndPropositoAndEstadoOrderByFechaExpiracionDesc(
                        usuario,
                        PropositoCodigoMfa.ENROLLMENT,
                        EstadoCodigoMfa.PENDIENTE
                )
                .orElseThrow(MfaEnrollmentNotFoundException::new);

        if (codigo.estaExpirado(LocalDateTime.now())) {
            codigo.expirar();
            codigoMfaEmailRepository.save(codigo);
            throw new MfaCodeExpiredException();
        }
        if (!passwordEncoder.matches(command.codigo(), codigo.getCodigoHash())) {
            throw new InvalidMfaCodeException();
        }

        codigo.utilizar();
        metodo.activar();
        codigoMfaEmailRepository.save(codigo);
        metodoRepository.save(metodo);
        return new MfaMethodResult(MetodoMfa.EMAIL_OTP.name(), metodo.getEstado().name());
    }

    private Usuario loadActiveUser(String correo) {
        Usuario usuario = usuarioRepository.findByCorreo(normalizeEmail(correo))
                .orElseThrow(UserNotFoundException::new);
        if (usuario.getEstado() != EstadoUsuario.ACTIVO) {
            throw new EmailNotVerifiedException();
        }
        return usuario;
    }

    private UsuarioMfaMetodo createOrResetPendingMethod(Usuario usuario, MetodoMfa metodoMfa) {
        UsuarioMfaMetodo metodo = metodoRepository.findByUsuarioAndMetodo(usuario, metodoMfa)
                .orElseGet(() -> new UsuarioMfaMetodo(usuario, metodoMfa, EstadoMfaMetodo.PENDIENTE));
        if (metodo.getEstado() == EstadoMfaMetodo.ACTIVO) {
            throw new MfaMethodAlreadyEnabledException();
        }
        metodo.dejarPendiente();
        return metodoRepository.save(metodo);
    }

    private void expirePendingEmailCodes(Usuario usuario) {
        var pendingCodes = codigoMfaEmailRepository.findByUsuarioAndPropositoAndEstado(
                usuario,
                PropositoCodigoMfa.ENROLLMENT,
                EstadoCodigoMfa.PENDIENTE
        );
        pendingCodes.forEach(CodigoMfaEmail::expirar);
        codigoMfaEmailRepository.saveAll(pendingCodes);
    }

    private static String normalizeEmail(String correo) {
        return correo == null ? "" : correo.trim().toLowerCase();
    }

    private static String generateOtp() {
        return String.format("%06d", SECURE_RANDOM.nextInt(1_000_000));
    }

    private static String toDataUrl(byte[] pngBytes) {
        return "data:image/png;base64," + Base64.getEncoder().encodeToString(pngBytes);
    }
}
