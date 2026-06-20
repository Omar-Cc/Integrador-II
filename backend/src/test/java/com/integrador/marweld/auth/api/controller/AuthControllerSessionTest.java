package com.integrador.marweld.auth.api.controller;

import com.integrador.marweld.auth.api.AuthCookieFactory;
import com.integrador.marweld.auth.api.mapper.AuthApiMapper;
import com.integrador.marweld.auth.api.request.LoginRequest;
import com.integrador.marweld.auth.api.response.AuthFlowResponse;
import com.integrador.marweld.auth.application.result.AuthFlowResult;
import com.integrador.marweld.auth.application.result.MfaChallengeResult;
import com.integrador.marweld.auth.application.service.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class AuthControllerSessionTest {
    @Test
    void authenticatedLoginSetsSecureRefreshCookieAttributes() {
        AuthService service = mock(AuthService.class);
        AuthApiMapper mapper = mock(AuthApiMapper.class);
        AuthCookieFactory cookies = new AuthCookieFactory(true, 30);
        AuthController controller = new AuthController(service, mapper, cookies);
        AuthFlowResult result = new AuthFlowResult("AUTHENTICATED", "jwt", 3600, null, null, "refresh");
        when(service.login(any())).thenReturn(result);
        when(mapper.toResponse(result)).thenReturn(new AuthFlowResponse("AUTHENTICATED", "jwt", 3600, null, null));

        var response = controller.login(new LoginRequest("omar@example.com", "Secret1!"), request());

        assertThat(response.getHeaders().getFirst("Set-Cookie"))
                .contains("marweld_refresh_token=refresh", "HttpOnly", "Secure", "SameSite=Lax", "Path=/api/auth");
    }

    @Test
    void mfaRequiredLoginDoesNotSetCookie() {
        AuthService service = mock(AuthService.class);
        AuthApiMapper mapper = mock(AuthApiMapper.class);
        AuthController controller = new AuthController(service, mapper, new AuthCookieFactory(false, 30));
        AuthFlowResult result = AuthFlowResult.mfaRequired(new MfaChallengeResult(
                UUID.randomUUID(), LocalDateTime.now().plusMinutes(5), List.of("TOTP"), "TOTP"));
        when(service.login(any())).thenReturn(result);
        when(mapper.toResponse(result)).thenReturn(new AuthFlowResponse("MFA_REQUIRED", null, 0, null, null));

        var response = controller.login(new LoginRequest("omar@example.com", "Secret1!"), request());

        assertThat(response.getHeaders().getFirst("Set-Cookie")).isNull();
    }

    private static MockHttpServletRequest request() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRemoteAddr("127.0.0.1");
        return request;
    }
}
