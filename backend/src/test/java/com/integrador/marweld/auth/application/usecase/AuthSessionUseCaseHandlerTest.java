package com.integrador.marweld.auth.application.usecase;

import com.integrador.marweld.auth.application.command.LoginCommand;
import com.integrador.marweld.auth.application.command.RefreshSessionCommand;
import com.integrador.marweld.auth.application.port.EmailSender;
import com.integrador.marweld.auth.domain.exception.EmailNotVerifiedException;
import com.integrador.marweld.auth.domain.exception.InvalidRefreshTokenException;
import com.integrador.marweld.auth.domain.model.*;
import com.integrador.marweld.auth.infrastructure.persistence.repository.*;
import com.integrador.marweld.auth.infrastructure.security.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthSessionUseCaseHandlerTest {
    @Mock UsuarioRepository usuarioRepository;
    @Mock ClienteRepository clienteRepository;
    @Mock UsuarioMfaMetodoRepository metodoRepository;
    @Mock UsuarioMfaTotpRepository totpRepository;
    @Mock CodigoMfaEmailRepository codigoRepository;
    @Mock DesafioMfaRepository desafioRepository;
    @Mock SesionUsuarioRepository sesionRepository;
    @Mock RefreshTokenRepository refreshRepository;
    @Mock PasswordEncoder passwordEncoder;
    @Mock OtpService otpService;
    @Mock TotpSecretCipher cipher;
    @Mock RefreshTokenCodec codec;
    @Mock AsymmetricJwtService jwtService;
    @Mock EmailSender emailSender;
    private AuthSessionUseCaseHandler handler;

    @BeforeEach
    void setUp() {
        handler = new AuthSessionUseCaseHandler(usuarioRepository, clienteRepository, metodoRepository,
                totpRepository, codigoRepository, desafioRepository, sesionRepository, refreshRepository,
                passwordEncoder, otpService, cipher, codec, jwtService, emailSender, 30);
    }

    @Test
    void pendingEmailNeverCreatesSessionOrToken() {
        Usuario user = user(EstadoUsuario.PENDIENTE_VERIFICACION_CORREO);
        when(usuarioRepository.findByCorreo("omar@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("Secret1!", "hash")).thenReturn(true);

        assertThatThrownBy(() -> handler.login(new LoginCommand(
                "omar@example.com", "Secret1!", "127.0.0.1", "test")))
                .isInstanceOf(EmailNotVerifiedException.class);
        verifyNoInteractions(sesionRepository, refreshRepository, desafioRepository, jwtService);
    }

    @Test
    void activeMfaCreatesOnlyChallenge() {
        Usuario user = user(EstadoUsuario.ACTIVO);
        UsuarioMfaMetodo method = new UsuarioMfaMetodo(user, MetodoMfa.TOTP, EstadoMfaMetodo.ACTIVO);
        when(usuarioRepository.findByCorreo("omar@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(anyString(), eq("hash"))).thenReturn(true);
        when(metodoRepository.findByUsuario(user)).thenReturn(List.of(method));
        when(desafioRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        var result = handler.login(new LoginCommand("omar@example.com", "Secret1!", "127.0.0.1", "test"));

        assertThat(result.status()).isEqualTo("MFA_REQUIRED");
        assertThat(result.accessToken()).isNull();
        assertThat(result.refreshToken()).isNull();
        verifyNoInteractions(sesionRepository, refreshRepository, jwtService);
    }

    @Test
    void loginWithoutMfaCreatesSessionAndOpaqueRefreshHash() {
        Usuario user = user(EstadoUsuario.ACTIVO);
        when(usuarioRepository.findByCorreo("omar@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(anyString(), eq("hash"))).thenReturn(true);
        when(metodoRepository.findByUsuario(user)).thenReturn(List.of());
        when(sesionRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(codec.generate()).thenReturn("raw-refresh");
        when(codec.hash("raw-refresh")).thenReturn("sha256-hash");
        when(jwtService.generateToken(eq(user.getPublicId().toString()), anyMap())).thenReturn("jwt");
        when(jwtService.getExpirationSeconds()).thenReturn(3600L);

        var result = handler.login(new LoginCommand("omar@example.com", "Secret1!", "127.0.0.1", "test"));

        assertThat(result.status()).isEqualTo("AUTHENTICATED");
        assertThat(result.accessToken()).isEqualTo("jwt");
        assertThat(result.refreshToken()).isEqualTo("raw-refresh");
        verify(refreshRepository).save(any(RefreshToken.class));
    }

    @Test
    void refreshTokenCannotBeReplayedAfterRotation() {
        Usuario user = user(EstadoUsuario.ACTIVO);
        SesionUsuario session = new SesionUsuario(user, "127.0.0.1", "test");
        RefreshToken current = new RefreshToken(session, "old-hash", LocalDateTime.now().plusDays(1));
        when(codec.hash("old-token")).thenReturn("old-hash");
        when(refreshRepository.findByTokenHash("old-hash")).thenReturn(Optional.of(current));
        when(codec.generate()).thenReturn("new-token");
        when(codec.hash("new-token")).thenReturn("new-hash");
        when(jwtService.generateToken(anyString(), anyMap())).thenReturn("jwt");
        when(jwtService.getExpirationSeconds()).thenReturn(3600L);

        assertThat(handler.refresh(new RefreshSessionCommand("old-token")).refreshToken()).isEqualTo("new-token");
        assertThatThrownBy(() -> handler.refresh(new RefreshSessionCommand("old-token")))
                .isInstanceOf(InvalidRefreshTokenException.class);
    }

    private static Usuario user(EstadoUsuario status) {
        Rol role = new Rol("CLIENTE", "Cliente", EstadoActividad.ACTIVO);
        return new Usuario(role, "Omar", "omar@example.com", "hash", null, status);
    }
}
