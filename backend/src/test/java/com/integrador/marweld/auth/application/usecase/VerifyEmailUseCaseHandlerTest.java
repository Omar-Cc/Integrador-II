package com.integrador.marweld.auth.application.usecase;

import com.integrador.marweld.auth.application.command.VerifyEmailCommand;
import com.integrador.marweld.auth.application.result.EmailVerificationResult;
import com.integrador.marweld.auth.domain.exception.AccountNotPendingVerificationException;
import com.integrador.marweld.auth.domain.exception.InvalidVerificationCodeException;
import com.integrador.marweld.auth.domain.exception.VerificationCodeExpiredException;
import com.integrador.marweld.auth.domain.model.CodigoVerificacion;
import com.integrador.marweld.auth.domain.model.EstadoActividad;
import com.integrador.marweld.auth.domain.model.EstadoCodigo;
import com.integrador.marweld.auth.domain.model.EstadoUsuario;
import com.integrador.marweld.auth.domain.model.Rol;
import com.integrador.marweld.auth.domain.model.Usuario;
import com.integrador.marweld.auth.infrastructure.persistence.repository.CodigoVerificacionRepository;
import com.integrador.marweld.auth.infrastructure.persistence.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class VerifyEmailUseCaseHandlerTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private CodigoVerificacionRepository codigoVerificacionRepository;

    private VerifyEmailUseCaseHandler handler;

    @BeforeEach
    void setUp() {
        handler = new VerifyEmailUseCaseHandler(usuarioRepository, codigoVerificacionRepository);
    }

    @Test
    void handleActivatesUserAndMarksCodeAsUsedWhenOtpIsValid() {
        Usuario usuario = pendingUser("omar@example.com");
        CodigoVerificacion codigo = new CodigoVerificacion(
                usuario,
                "123456",
                LocalDateTime.now().plusMinutes(10),
                EstadoCodigo.PENDIENTE
        );
        when(usuarioRepository.findByCorreo("omar@example.com")).thenReturn(Optional.of(usuario));
        when(codigoVerificacionRepository.findFirstByUsuarioAndCodigoAndEstadoOrderByFechaExpiracionDesc(
                usuario,
                "123456",
                EstadoCodigo.PENDIENTE
        )).thenReturn(Optional.of(codigo));

        EmailVerificationResult result = handler.handle(new VerifyEmailCommand(" Omar@Example.COM ", "123456"));

        assertThat(usuario.getEstado()).isEqualTo(EstadoUsuario.ACTIVO);
        assertThat(codigo.getEstado()).isEqualTo(EstadoCodigo.UTILIZADO);
        assertThat(result.correo()).isEqualTo("omar@example.com");
        assertThat(result.estado()).isEqualTo("ACTIVO");
        verify(codigoVerificacionRepository).save(codigo);
        verify(usuarioRepository).save(usuario);
    }

    @Test
    void handleExpiresCodeAndFailsWhenOtpIsExpired() {
        Usuario usuario = pendingUser("omar@example.com");
        CodigoVerificacion codigo = new CodigoVerificacion(
                usuario,
                "123456",
                LocalDateTime.now().minusMinutes(1),
                EstadoCodigo.PENDIENTE
        );
        when(usuarioRepository.findByCorreo("omar@example.com")).thenReturn(Optional.of(usuario));
        when(codigoVerificacionRepository.findFirstByUsuarioAndCodigoAndEstadoOrderByFechaExpiracionDesc(
                usuario,
                "123456",
                EstadoCodigo.PENDIENTE
        )).thenReturn(Optional.of(codigo));

        assertThatThrownBy(() -> handler.handle(new VerifyEmailCommand("omar@example.com", "123456")))
                .isInstanceOf(VerificationCodeExpiredException.class);

        assertThat(codigo.getEstado()).isEqualTo(EstadoCodigo.EXPIRADO);
        assertThat(usuario.getEstado()).isEqualTo(EstadoUsuario.PENDIENTE_VERIFICACION_CORREO);
        verify(codigoVerificacionRepository).save(codigo);
        verify(usuarioRepository, never()).save(usuario);
    }

    @Test
    void handleFailsWhenOtpDoesNotExistForUser() {
        Usuario usuario = pendingUser("omar@example.com");
        when(usuarioRepository.findByCorreo("omar@example.com")).thenReturn(Optional.of(usuario));
        when(codigoVerificacionRepository.findFirstByUsuarioAndCodigoAndEstadoOrderByFechaExpiracionDesc(
                usuario,
                "000000",
                EstadoCodigo.PENDIENTE
        )).thenReturn(Optional.empty());

        assertThatThrownBy(() -> handler.handle(new VerifyEmailCommand("omar@example.com", "000000")))
                .isInstanceOf(InvalidVerificationCodeException.class);

        verify(usuarioRepository, never()).save(usuario);
    }

    @Test
    void handleFailsWhenAccountIsNotPendingVerification() {
        Usuario usuario = pendingUser("omar@example.com");
        usuario.setEstado(EstadoUsuario.ACTIVO);
        when(usuarioRepository.findByCorreo("omar@example.com")).thenReturn(Optional.of(usuario));

        assertThatThrownBy(() -> handler.handle(new VerifyEmailCommand("omar@example.com", "123456")))
                .isInstanceOf(AccountNotPendingVerificationException.class);

        verify(codigoVerificacionRepository, never())
                .findFirstByUsuarioAndCodigoAndEstadoOrderByFechaExpiracionDesc(
                        usuario,
                        "123456",
                        EstadoCodigo.PENDIENTE
                );
    }

    private Usuario pendingUser(String correo) {
        Rol rol = new Rol("CLIENTE", "Cliente", EstadoActividad.ACTIVO);
        return new Usuario(
                rol,
                "Omar Castillo",
                correo,
                "hash",
                "+51999888777",
                EstadoUsuario.PENDIENTE_VERIFICACION_CORREO
        );
    }
}
