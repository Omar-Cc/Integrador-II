package com.integrador.marweld.orders.api.controller;

import com.integrador.marweld.core.config.GlobalExceptionHandler;
import com.integrador.marweld.orders.application.result.CheckoutResult;
import com.integrador.marweld.orders.application.usecase.CheckoutUseCase;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(CheckoutController.class)
@AutoConfigureMockMvc
@Import(GlobalExceptionHandler.class)
class CheckoutControllerTest {
    private static final String USER_PUBLIC_ID = "7f84c99a-1d30-4c39-8e72-ff7ab96f6c1c";

    @Autowired
    private MockMvc mockMvc;
    @MockitoBean
    private CheckoutUseCase checkoutUseCase;
    @MockitoBean
    private JwtDecoder jwtDecoder;

    @Test
    void checkoutReturnsPersistedApprovalOutcome() throws Exception {
        UUID orderId = UUID.randomUUID();
        UUID paymentId = UUID.randomUUID();
        when(checkoutUseCase.checkout(eq(USER_PUBLIC_ID), any())).thenReturn(
                new CheckoutResult(orderId, paymentId, true, "PAGADO", "APROBADO", new BigDecimal("125.50")));

        mockMvc.perform(post("/api/checkout")
                        .with(jwt().jwt(token -> token.subject(USER_PUBLIC_ID)))
                        .contentType("application/json")
                        .content("""
                                {"items":[{"productoPublicId":"%s","cantidad":1}],"modalidadEntrega":"TIENDA","correo":"cliente@example.com"}
                                """.formatted(UUID.randomUUID())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("success"))
                .andExpect(jsonPath("$.data.orderPublicId").value(orderId.toString()))
                .andExpect(jsonPath("$.data.paymentApproved").value(true));
    }
}
