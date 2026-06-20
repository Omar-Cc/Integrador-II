package com.integrador.marweld.auth.api.controller;

import com.integrador.marweld.auth.api.mapper.MfaApiMapper;
import com.integrador.marweld.auth.application.result.EmailMfaSetupResult;
import com.integrador.marweld.auth.application.result.MfaMethodResult;
import com.integrador.marweld.auth.application.result.MfaStatusResult;
import com.integrador.marweld.auth.application.service.AuthService;
import com.integrador.marweld.auth.domain.exception.EmailNotVerifiedException;
import com.integrador.marweld.core.config.GlobalExceptionHandler;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(MfaController.class)
@AutoConfigureMockMvc
@Import({MfaApiMapper.class, GlobalExceptionHandler.class})
class MfaControllerTest {

    private static final String USER_PUBLIC_ID = "7f84c99a-1d30-4c39-8e72-ff7ab96f6c1c";

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AuthService authService;

    @MockitoBean
    private JwtDecoder jwtDecoder;

    @Test
    void getStatusReturnsStandardApiResponse() throws Exception {
        when(authService.getMfaStatus(any()))
                .thenReturn(new MfaStatusResult(true, false));

        mockMvc.perform(get("/api/me/2fa")
                        .with(jwt().jwt(token -> token.subject(USER_PUBLIC_ID))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("success"))
                .andExpect(jsonPath("$.data.totpEnabled").value(true))
                .andExpect(jsonPath("$.data.emailOtpEnabled").value(false));
    }

    @Test
    void startEmailSetupReturnsStandardApiResponse() throws Exception {
        LocalDateTime expiration = LocalDateTime.of(2026, 6, 18, 10, 30);
        when(authService.startEmailMfaSetup(any()))
                .thenReturn(new EmailMfaSetupResult("EMAIL_OTP", "PENDIENTE", expiration));

        mockMvc.perform(post("/api/me/2fa/email/setup")
                        .with(jwt().jwt(token -> token.subject(USER_PUBLIC_ID))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("success"))
                .andExpect(jsonPath("$.data.metodo").value("EMAIL_OTP"))
                .andExpect(jsonPath("$.data.estado").value("PENDIENTE"))
                .andExpect(jsonPath("$.data.fechaExpiracion").value("2026-06-18T10:30:00"));
    }

    @Test
    void confirmEmailSetupReturnsMethodResponse() throws Exception {
        when(authService.confirmEmailMfaSetup(any()))
                .thenReturn(new MfaMethodResult("EMAIL_OTP", "ACTIVO"));

        mockMvc.perform(post("/api/me/2fa/email/confirm")
                        .with(jwt().jwt(token -> token.subject(USER_PUBLIC_ID)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "codigo": "123456"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.metodo").value("EMAIL_OTP"))
                .andExpect(jsonPath("$.data.estado").value("ACTIVO"));
    }

    @Test
    void mfaEndpointPreservesEmailNotVerifiedErrorCode() throws Exception {
        when(authService.getMfaStatus(any()))
                .thenThrow(new EmailNotVerifiedException());

        mockMvc.perform(get("/api/me/2fa")
                        .with(jwt().jwt(token -> token.subject(USER_PUBLIC_ID))))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.errorCode").value("EMAIL_NOT_VERIFIED"));
    }
}
