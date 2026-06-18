package com.integrador.marweld.auth.application.usecase;

import com.integrador.marweld.auth.application.command.ResendVerificationCodeCommand;
import com.integrador.marweld.auth.application.port.EmailSender;
import com.integrador.marweld.auth.application.result.EmailVerificationResult;
import com.integrador.marweld.auth.domain.exception.AccountNotPendingVerificationException;
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
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ResendVerificationCodeUseCaseHandlerTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private CodigoVerificacionRepository codigoVerificacionRepository;

    @Mock
    private EmailSender emailSender;

    private ResendVerificationCodeUseCaseHandler handler;

    @BeforeEach
    void setUp() {
        handler = new ResendVerificationCodeUseCaseHandler(
                usuarioRepository,
                codigoVerificacionRepository,
                emailSender
        );
    }

    @Test
    void handleExpiresPreviousPendingCodesCreatesNewOtpAndSendsEmail() {
        Usuario usuario = pendingUser("omar@example.com");
        CodigoVerificacion previousCode = new CodigoVerificacion(
                usuario,
                "111111",
                LocalDateTime.now().plusMinutes(5),
                EstadoCodigo.PENDIENTE
        );
        when(usuarioRepository.findByCorreo("omar@example.com")).thenReturn(Optional.of(usuario));
        when(codigoVerificacionRepository.findByUsuarioAndEstado(usuario, EstadoCodigo.PENDIENTE))
                .thenReturn(List.of(previousCode));

        EmailVerificationResult result = handler.handle(new ResendVerificationCodeCommand(" Omar@Example.COM "));

        ArgumentCaptor<CodigoVerificacion> codeCaptor = ArgumentCaptor.forClass(CodigoVerificacion.class);
        verify(codigoVerificacionRepository).saveAll(List.of(previousCode));
        verify(codigoVerificacionRepository).save(codeCaptor.capture());
        CodigoVerificacion newCode = codeCaptor.getValue();

        assertThat(previousCode.getEstado()).isEqualTo(EstadoCodigo.EXPIRADO);
        assertThat(newCode.getUsuario()).isSameAs(usuario);
        assertThat(newCode.getCodigo()).matches("\\d{6}");
        assertThat(newCode.getEstado()).isEqualTo(EstadoCodigo.PENDIENTE);
        assertThat(newCode.getFechaExpiracion()).isAfter(LocalDateTime.now().plusMinutes(14));
        assertThat(result.correo()).isEqualTo("omar@example.com");
        assertThat(result.estado()).isEqualTo("PENDIENTE_VERIFICACION_CORREO");
        verify(emailSender).sendVerificationEmail("omar@example.com", "Omar Castillo", newCode.getCodigo());
    }

    @Test
    void handleFailsWhenAccountIsNotPendingVerification() {
        Usuario usuario = pendingUser("omar@example.com");
        usuario.setEstado(EstadoUsuario.ACTIVO);
        when(usuarioRepository.findByCorreo("omar@example.com")).thenReturn(Optional.of(usuario));

        assertThatThrownBy(() -> handler.handle(new ResendVerificationCodeCommand("omar@example.com")))
                .isInstanceOf(AccountNotPendingVerificationException.class);

        verify(codigoVerificacionRepository, never()).findByUsuarioAndEstado(usuario, EstadoCodigo.PENDIENTE);
        verifyNoInteractions(emailSender);
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
