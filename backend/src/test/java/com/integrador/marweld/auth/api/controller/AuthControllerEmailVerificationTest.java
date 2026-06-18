package com.integrador.marweld.auth.api.controller;

import com.integrador.marweld.auth.api.mapper.AuthApiMapper;
import com.integrador.marweld.auth.application.result.EmailVerificationResult;
import com.integrador.marweld.auth.application.service.AuthService;
import com.integrador.marweld.auth.domain.exception.AccountNotPendingVerificationException;
import com.integrador.marweld.auth.domain.exception.InvalidVerificationCodeException;
import com.integrador.marweld.auth.domain.exception.UserNotFoundException;
import com.integrador.marweld.auth.domain.exception.VerificationCodeExpiredException;
import com.integrador.marweld.core.config.GlobalExceptionHandler;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.hamcrest.Matchers.containsString;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import({AuthApiMapper.class, GlobalExceptionHandler.class})
class AuthControllerEmailVerificationTest {

    private static final UUID USER_PUBLIC_ID = UUID.fromString("550e8400-e29b-41d4-a716-446655440000");

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AuthService authService;

    @Test
    void verifyEmailReturnsStandardApiResponse() throws Exception {
        when(authService.verifyEmail(any()))
                .thenReturn(new EmailVerificationResult(USER_PUBLIC_ID, "omar@example.com", "ACTIVO"));

        mockMvc.perform(post("/api/auth/verify-email")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "correo": "omar@example.com",
                                  "codigo": "123456"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("success"))
                .andExpect(jsonPath("$.message").value("Correo verificado correctamente. Tu cuenta ya se encuentra activa."))
                .andExpect(jsonPath("$.data.userPublicId").value(USER_PUBLIC_ID.toString()))
                .andExpect(jsonPath("$.data.correo").value("omar@example.com"))
                .andExpect(jsonPath("$.data.estado").value("ACTIVO"));
    }

    @Test
    void resendVerificationCodeReturnsStandardApiResponse() throws Exception {
        when(authService.resendVerificationCode(any()))
                .thenReturn(new EmailVerificationResult(
                        USER_PUBLIC_ID,
                        "omar@example.com",
                        "PENDIENTE_VERIFICACION_CORREO"
                ));

        mockMvc.perform(post("/api/auth/resend-verification-code")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "correo": "omar@example.com"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("success"))
                .andExpect(jsonPath("$.message").value("Codigo de verificacion reenviado. Revisa tu correo para validar tu cuenta."))
                .andExpect(jsonPath("$.data.userPublicId").value(USER_PUBLIC_ID.toString()))
                .andExpect(jsonPath("$.data.correo").value("omar@example.com"))
                .andExpect(jsonPath("$.data.estado").value("PENDIENTE_VERIFICACION_CORREO"));
    }

    @Test
    void verifyEmailRejectsInvalidCodeFormatWithValidationErrorCode() throws Exception {
        mockMvc.perform(post("/api/auth/verify-email")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "correo": "omar@example.com",
                                  "codigo": "ABC123"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errorCode").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.message", containsString("codigo")));
    }

    @Test
    void verifyEmailReturnsInvalidVerificationCodeErrorCode() throws Exception {
        when(authService.verifyEmail(any()))
                .thenThrow(new InvalidVerificationCodeException());

        mockMvc.perform(post("/api/auth/verify-email")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "correo": "omar@example.com",
                                  "codigo": "999999"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errorCode").value("INVALID_VERIFICATION_CODE"))
                .andExpect(jsonPath("$.message").value("El codigo de verificacion es invalido."));
    }

    @Test
    void verifyEmailReturnsExpiredVerificationCodeErrorCode() throws Exception {
        when(authService.verifyEmail(any()))
                .thenThrow(new VerificationCodeExpiredException());

        mockMvc.perform(post("/api/auth/verify-email")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "correo": "omar@example.com",
                                  "codigo": "123456"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errorCode").value("VERIFICATION_CODE_EXPIRED"))
                .andExpect(jsonPath("$.message").value("El codigo de verificacion ha expirado. Solicita uno nuevo."));
    }

    @Test
    void resendVerificationCodeReturnsUserNotFoundErrorCode() throws Exception {
        when(authService.resendVerificationCode(any()))
                .thenThrow(new UserNotFoundException());

        mockMvc.perform(post("/api/auth/resend-verification-code")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "correo": "missing@example.com"
                                }
                                """))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.errorCode").value("USER_NOT_FOUND"))
                .andExpect(jsonPath("$.message").value("No existe una cuenta registrada con ese correo."));
    }

    @Test
    void resendVerificationCodeReturnsAccountNotPendingErrorCode() throws Exception {
        when(authService.resendVerificationCode(any()))
                .thenThrow(new AccountNotPendingVerificationException());

        mockMvc.perform(post("/api/auth/resend-verification-code")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "correo": "omar@example.com"
                                }
                                """))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.errorCode").value("ACCOUNT_NOT_PENDING_VERIFICATION"))
                .andExpect(jsonPath("$.message").value("La cuenta no se encuentra pendiente de verificacion de correo."));
    }
}
