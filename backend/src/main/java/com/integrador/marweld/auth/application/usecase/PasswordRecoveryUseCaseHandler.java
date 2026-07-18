package com.integrador.marweld.auth.application.usecase;

import com.integrador.marweld.auth.application.port.EmailSender;
import com.integrador.marweld.auth.domain.exception.InvalidVerificationCodeException;
import com.integrador.marweld.auth.domain.exception.VerificationCodeExpiredException;
import com.integrador.marweld.auth.domain.exception.EmailDeliveryException;
import com.integrador.marweld.auth.domain.model.CodigoRecuperacionContrasena;
import com.integrador.marweld.auth.domain.model.EstadoCodigoRecuperacion;
import com.integrador.marweld.auth.domain.model.EstadoSesionUsuario;
import com.integrador.marweld.auth.domain.model.EstadoUsuario;
import com.integrador.marweld.auth.domain.model.Usuario;
import com.integrador.marweld.auth.infrastructure.persistence.repository.CodigoRecuperacionContrasenaRepository;
import com.integrador.marweld.auth.infrastructure.persistence.repository.SesionUsuarioRepository;
import com.integrador.marweld.auth.infrastructure.persistence.repository.UsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;

@Component
public class PasswordRecoveryUseCaseHandler implements PasswordRecoveryUseCase {
    private static final Logger log = LoggerFactory.getLogger(PasswordRecoveryUseCaseHandler.class);
    private static final SecureRandom RANDOM = new SecureRandom();
    private static final int TTL_MINUTES = 15;
    private static final int MAX_CODES_PER_WINDOW = 3;

    private final UsuarioRepository usuarioRepository;
    private final CodigoRecuperacionContrasenaRepository codigoRepository;
    private final SesionUsuarioRepository sesionRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailSender emailSender;

    public PasswordRecoveryUseCaseHandler(UsuarioRepository usuarioRepository,
                                          CodigoRecuperacionContrasenaRepository codigoRepository,
                                          SesionUsuarioRepository sesionRepository,
                                          PasswordEncoder passwordEncoder,
                                          EmailSender emailSender) {
        this.usuarioRepository = usuarioRepository;
        this.codigoRepository = codigoRepository;
        this.sesionRepository = sesionRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailSender = emailSender;
    }

    @Override
    public void requestReset(String correo) {
        Usuario usuario = usuarioRepository.findByCorreo(normalize(correo)).orElse(null);
        if (usuario == null || usuario.getEstado() != EstadoUsuario.ACTIVO) {
            return; // Respuesta idéntica para no revelar cuentas registradas.
        }

        LocalDateTime now = LocalDateTime.now();
        codigoRepository.findFirstByUsuarioOrderByFechaCreacionDesc(usuario)
                .filter(last -> last.getFechaCreacion().plusSeconds(60).isAfter(now))
                .ifPresentOrElse(last -> { }, () -> issueCode(usuario, now));
    }

    private void issueCode(Usuario usuario, LocalDateTime now) {
        if (codigoRepository.countByUsuarioAndFechaCreacionAfter(usuario, now.minusMinutes(15)) >= MAX_CODES_PER_WINDOW) {
            return;
        }
        List<CodigoRecuperacionContrasena> pending = codigoRepository.findByUsuarioAndEstado(
                usuario, EstadoCodigoRecuperacion.PENDIENTE);
        pending.forEach(CodigoRecuperacionContrasena::expirar);
        codigoRepository.saveAll(pending);

        String code = String.format("%06d", RANDOM.nextInt(1_000_000));
        CodigoRecuperacionContrasena resetCode = codigoRepository.save(new CodigoRecuperacionContrasena(
                usuario, passwordEncoder.encode(code), now.plusMinutes(TTL_MINUTES)));
        try {
            emailSender.sendPasswordResetEmail(usuario.getCorreo(), usuario.getNombre(), code);
        } catch (EmailDeliveryException exception) {
            codigoRepository.delete(resetCode);
            log.error("No se pudo enviar el código de recuperación para el usuario {}", usuario.getIdUsuario(), exception);
        }
    }

    @Override
    public void confirmReset(String correo, String codigo, String contrasena) {
        Usuario usuario = usuarioRepository.findByCorreo(normalize(correo))
                .orElseThrow(InvalidVerificationCodeException::new);
        CodigoRecuperacionContrasena resetCode = codigoRepository
                .findFirstByUsuarioAndEstadoOrderByFechaCreacionDesc(usuario, EstadoCodigoRecuperacion.PENDIENTE)
                .orElseThrow(InvalidVerificationCodeException::new);

        if (resetCode.estaExpirado(LocalDateTime.now())) {
            resetCode.expirar();
            codigoRepository.save(resetCode);
            throw new VerificationCodeExpiredException();
        }
        if (!passwordEncoder.matches(codigo, resetCode.getCodigoHash())) {
            throw new InvalidVerificationCodeException();
        }

        usuario.setContrasena(passwordEncoder.encode(contrasena));
        resetCode.utilizar();
        sesionRepository.findByUsuarioAndEstado(usuario, EstadoSesionUsuario.ACTIVA)
                .forEach(sesion -> sesion.cerrar());
        usuarioRepository.save(usuario);
        codigoRepository.save(resetCode);
    }

    private static String normalize(String correo) {
        return correo == null ? "" : correo.trim().toLowerCase();
    }
}
