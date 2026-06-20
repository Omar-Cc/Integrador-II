package com.integrador.marweld.auth.application.usecase;

import com.integrador.marweld.auth.application.command.VerifyEmailCommand;
import com.integrador.marweld.auth.application.result.EmailVerificationResult;
import com.integrador.marweld.auth.domain.exception.AccountNotPendingVerificationException;
import com.integrador.marweld.auth.domain.exception.InvalidVerificationCodeException;
import com.integrador.marweld.auth.domain.exception.UserNotFoundException;
import com.integrador.marweld.auth.domain.exception.VerificationCodeExpiredException;
import com.integrador.marweld.auth.domain.model.CodigoVerificacion;
import com.integrador.marweld.auth.domain.model.EstadoCodigo;
import com.integrador.marweld.auth.domain.model.EstadoUsuario;
import com.integrador.marweld.auth.domain.model.Usuario;
import com.integrador.marweld.auth.infrastructure.persistence.repository.CodigoVerificacionRepository;
import com.integrador.marweld.auth.infrastructure.persistence.repository.UsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class VerifyEmailUseCaseHandler implements VerifyEmailUseCase {

    private static final Logger log = LoggerFactory.getLogger(VerifyEmailUseCaseHandler.class);

    private final UsuarioRepository usuarioRepository;
    private final CodigoVerificacionRepository codigoVerificacionRepository;

    public VerifyEmailUseCaseHandler(
            UsuarioRepository usuarioRepository,
            CodigoVerificacionRepository codigoVerificacionRepository) {
        this.usuarioRepository = usuarioRepository;
        this.codigoVerificacionRepository = codigoVerificacionRepository;
    }

    @Override
    public EmailVerificationResult handle(VerifyEmailCommand command) {
        String correoNormalizado = command.correo().trim().toLowerCase();
        String codigoNormalizado = command.codigo().trim();

        log.info("Iniciando verificacion de correo para: {}", correoNormalizado);

        Usuario usuario = usuarioRepository.findByCorreo(correoNormalizado)
                .orElseThrow(UserNotFoundException::new);

        ensurePendingVerification(usuario);

        CodigoVerificacion codigoVerificacion = codigoVerificacionRepository
                .findFirstByUsuarioAndCodigoAndEstadoOrderByFechaExpiracionDesc(
                        usuario,
                        codigoNormalizado,
                        EstadoCodigo.PENDIENTE
                )
                .orElseThrow(InvalidVerificationCodeException::new);

        if (codigoVerificacion.getFechaExpiracion().isBefore(LocalDateTime.now())) {
            codigoVerificacion.setEstado(EstadoCodigo.EXPIRADO);
            codigoVerificacionRepository.save(codigoVerificacion);
            log.warn("Codigo de verificacion expirado para el correo: {}", correoNormalizado);
            throw new VerificationCodeExpiredException();
        }

        codigoVerificacion.setEstado(EstadoCodigo.UTILIZADO);
        usuario.setEstado(EstadoUsuario.ACTIVO);
        codigoVerificacionRepository.save(codigoVerificacion);
        usuarioRepository.save(usuario);

        log.info("Correo verificado correctamente para: {}", correoNormalizado);

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
}
