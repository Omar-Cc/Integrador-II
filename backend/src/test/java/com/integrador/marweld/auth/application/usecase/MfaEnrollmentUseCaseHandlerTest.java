package com.integrador.marweld.auth.application.usecase;

import com.integrador.marweld.auth.application.command.MfaAuthenticatedCommand;
import com.integrador.marweld.auth.application.port.EmailSender;
import com.integrador.marweld.auth.application.result.EmailMfaSetupResult;
import com.integrador.marweld.auth.application.result.MfaStatusResult;
import com.integrador.marweld.auth.domain.exception.EmailNotVerifiedException;
import com.integrador.marweld.auth.domain.model.CodigoMfaEmail;
import com.integrador.marweld.auth.domain.model.EstadoActividad;
import com.integrador.marweld.auth.domain.model.EstadoCodigoMfa;
import com.integrador.marweld.auth.domain.model.EstadoMfaMetodo;
import com.integrador.marweld.auth.domain.model.EstadoUsuario;
import com.integrador.marweld.auth.domain.model.MetodoMfa;
import com.integrador.marweld.auth.domain.model.PropositoCodigoMfa;
import com.integrador.marweld.auth.domain.model.Rol;
import com.integrador.marweld.auth.domain.model.Usuario;
import com.integrador.marweld.auth.infrastructure.persistence.repository.CodigoMfaEmailRepository;
import com.integrador.marweld.auth.infrastructure.persistence.repository.UsuarioMfaMetodoRepository;
import com.integrador.marweld.auth.infrastructure.persistence.repository.UsuarioMfaTotpRepository;
import com.integrador.marweld.auth.infrastructure.persistence.repository.UsuarioRepository;
import com.integrador.marweld.auth.infrastructure.security.OtpService;
import com.integrador.marweld.auth.infrastructure.security.QrCodeService;
import com.integrador.marweld.auth.infrastructure.security.TotpSecretCipher;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MfaEnrollmentUseCaseHandlerTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private UsuarioMfaMetodoRepository metodoRepository;

    @Mock
    private UsuarioMfaTotpRepository totpRepository;

    @Mock
    private CodigoMfaEmailRepository codigoMfaEmailRepository;

    @Mock
    private OtpService otpService;

    @Mock
    private QrCodeService qrCodeService;

    @Mock
    private TotpSecretCipher totpSecretCipher;

    @Mock
    private EmailSender emailSender;

    private MfaEnrollmentUseCaseHandler handler;
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        passwordEncoder = new BCryptPasswordEncoder(4);
        handler = new MfaEnrollmentUseCaseHandler(
                usuarioRepository,
                metodoRepository,
                totpRepository,
                codigoMfaEmailRepository,
                otpService,
                qrCodeService,
                totpSecretCipher,
                passwordEncoder,
                emailSender
        );
    }

    @Test
    void getMfaStatusReturnsEnabledMethods() {
        Usuario usuario = activeUser();
        when(usuarioRepository.findByCorreo("omar@example.com")).thenReturn(Optional.of(usuario));
        when(metodoRepository.existsByUsuarioAndMetodoAndEstado(usuario, MetodoMfa.TOTP, EstadoMfaMetodo.ACTIVO)).thenReturn(true);
        when(metodoRepository.existsByUsuarioAndMetodoAndEstado(usuario, MetodoMfa.EMAIL_OTP, EstadoMfaMetodo.ACTIVO)).thenReturn(false);

        MfaStatusResult result = handler.getMfaStatus(new MfaAuthenticatedCommand(" Omar@Example.com "));

        assertThat(result.totpEnabled()).isTrue();
        assertThat(result.emailOtpEnabled()).isFalse();
    }

    @Test
    void startEmailMfaSetupExpiresPreviousCodesAndSendsNewOtp() {
        Usuario usuario = activeUser();
        CodigoMfaEmail previousCode = new CodigoMfaEmail(
                usuario,
                passwordEncoder.encode("111111"),
                PropositoCodigoMfa.ENROLLMENT,
                LocalDateTime.now().plusMinutes(1)
        );
        when(usuarioRepository.findByCorreo("omar@example.com")).thenReturn(Optional.of(usuario));
        when(metodoRepository.findByUsuarioAndMetodo(usuario, MetodoMfa.EMAIL_OTP)).thenReturn(Optional.empty());
        when(metodoRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(codigoMfaEmailRepository.findByUsuarioAndPropositoAndEstado(usuario, PropositoCodigoMfa.ENROLLMENT, EstadoCodigoMfa.PENDIENTE))
                .thenReturn(List.of(previousCode));
        when(codigoMfaEmailRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        EmailMfaSetupResult result = handler.startEmailMfaSetup(new MfaAuthenticatedCommand("omar@example.com"));

        assertThat(result.metodo()).isEqualTo("EMAIL_OTP");
        assertThat(result.estado()).isEqualTo("PENDIENTE");
        assertThat(result.fechaExpiracion()).isAfter(LocalDateTime.now());
        ArgumentCaptor<CodigoMfaEmail> codeCaptor = ArgumentCaptor.forClass(CodigoMfaEmail.class);
        verify(codigoMfaEmailRepository).save(codeCaptor.capture());
        assertThat(passwordEncoder.matches("000000", codeCaptor.getValue().getCodigoHash())).isFalse();
        verify(emailSender).sendMfaEmailOtp(any(), any(), any());
    }

    @Test
    void mfaRequiresVerifiedEmail() {
        Usuario usuario = activeUser();
        usuario.setEstado(EstadoUsuario.PENDIENTE_VERIFICACION_CORREO);
        when(usuarioRepository.findByCorreo("omar@example.com")).thenReturn(Optional.of(usuario));

        assertThatThrownBy(() -> handler.getMfaStatus(new MfaAuthenticatedCommand("omar@example.com")))
                .isInstanceOf(EmailNotVerifiedException.class);
    }

    private static Usuario activeUser() {
        Rol rol = new Rol("CLIENTE", "Cliente ecommerce", EstadoActividad.ACTIVO);
        return new Usuario(rol, "Omar", "omar@example.com", "hashed", "+51999999999", EstadoUsuario.ACTIVO);
    }
}
