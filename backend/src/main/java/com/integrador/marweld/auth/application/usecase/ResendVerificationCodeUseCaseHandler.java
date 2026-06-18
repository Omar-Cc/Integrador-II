package com.integrador.marweld.auth.application.usecase;

import com.integrador.marweld.auth.application.command.ResendVerificationCodeCommand;
import com.integrador.marweld.auth.application.port.EmailSender;
import com.integrador.marweld.auth.application.result.EmailVerificationResult;
import com.integrador.marweld.auth.domain.exception.AccountNotPendingVerificationException;
import com.integrador.marweld.auth.domain.exception.UserNotFoundException;
import com.integrador.marweld.auth.domain.model.CodigoVerificacion;
import com.integrador.marweld.auth.domain.model.EstadoCodigo;
import com.integrador.marweld.auth.domain.model.EstadoUsuario;
import com.integrador.marweld.auth.domain.model.Usuario;
import com.integrador.marweld.auth.infrastructure.persistence.repository.CodigoVerificacionRepository;
import com.integrador.marweld.auth.infrastructure.persistence.repository.UsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;

@Component
public class ResendVerificationCodeUseCaseHandler implements ResendVerificationCodeUseCase {

    private static final Logger log = LoggerFactory.getLogger(ResendVerificationCodeUseCaseHandler.class);
    private static final SecureRandom random = new SecureRandom();

    private final UsuarioRepository usuarioRepository;
    private final CodigoVerificacionRepository codigoVerificacionRepository;
    private final EmailSender emailSender;

    public ResendVerificationCodeUseCaseHandler(
            UsuarioRepository usuarioRepository,
            CodigoVerificacionRepository codigoVerificacionRepository,
            EmailSender emailSender) {
        this.usuarioRepository = usuarioRepository;
        this.codigoVerificacionRepository = codigoVerificacionRepository;
        this.emailSender = emailSender;
    }

    @Override
    public EmailVerificationResult handle(ResendVerificationCodeCommand command) {
        String correoNormalizado = command.correo().trim().toLowerCase();

        log.info("Iniciando reenvio de codigo de verificacion para: {}", correoNormalizado);

        Usuario usuario = usuarioRepository.findByCorreo(correoNormalizado)
                .orElseThrow(UserNotFoundException::new);

        ensurePendingVerification(usuario);
        expirePendingCodes(usuario);

        String otp = generateOtp();
        CodigoVerificacion codigoVerificacion = new CodigoVerificacion(
                usuario,
                otp,
                LocalDateTime.now().plusMinutes(15),
                EstadoCodigo.PENDIENTE
        );
        codigoVerificacionRepository.save(codigoVerificacion);

        emailSender.sendVerificationEmail(usuario.getCorreo(), usuario.getNombre(), otp);

        log.info("Codigo de verificacion reenviado para: {}", correoNormalizado);

        return new EmailVerificationResult(
                usuario.getPublicId(),
                usuario.getCorreo(),
                usuario.getEstado().name()
        );
    }

    private void ensurePendingVerification(Usuario usuario) {
        if (usuario.getEstado() != EstadoUsuario.PENDIENTE_VERIFICACION_CORREO) {
            throw new AccountNotPendingVerificationException();
        }
    }

    private void expirePendingCodes(Usuario usuario) {
        List<CodigoVerificacion> pendingCodes = codigoVerificacionRepository
                .findByUsuarioAndEstado(usuario, EstadoCodigo.PENDIENTE);
        pendingCodes.forEach(code -> code.setEstado(EstadoCodigo.EXPIRADO));
        codigoVerificacionRepository.saveAll(pendingCodes);
    }

    private String generateOtp() {
        int codeInt = random.nextInt(900000) + 100000;
        return String.valueOf(codeInt);
    }
}
