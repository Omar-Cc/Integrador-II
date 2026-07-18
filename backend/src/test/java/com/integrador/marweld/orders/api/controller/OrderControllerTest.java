package com.integrador.marweld.orders.api.controller;

import com.integrador.marweld.core.config.GlobalExceptionHandler;
import com.integrador.marweld.orders.application.result.OrderDetailResult;
import com.integrador.marweld.orders.application.result.OrderSummaryResult;
import com.integrador.marweld.orders.application.usecase.GetCustomerOrdersUseCase;
import com.integrador.marweld.orders.domain.exception.OrderNotFoundException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(OrderController.class)
@AutoConfigureMockMvc
@Import(GlobalExceptionHandler.class)
class OrderControllerTest {
    private static final String USER_PUBLIC_ID = "7f84c99a-1d30-4c39-8e72-ff7ab96f6c1c";

    @Autowired
    private MockMvc mockMvc;
    @MockitoBean
    private GetCustomerOrdersUseCase getCustomerOrdersUseCase;
    @MockitoBean
    private JwtDecoder jwtDecoder;

    @Test
    void getOrdersReturnsTheAuthenticatedCustomerHistory() throws Exception {
        UUID orderId = UUID.randomUUID();
        when(getCustomerOrdersUseCase.getOrders(USER_PUBLIC_ID)).thenReturn(List.of(
                new OrderSummaryResult(orderId, "PAGADO", "Pagado", new BigDecimal("125.50"),
                        LocalDateTime.of(2026, 7, 18, 9, 30), 1)));

        mockMvc.perform(get("/api/me/orders").with(jwt().jwt(token -> token.subject(USER_PUBLIC_ID))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("success"))
                .andExpect(jsonPath("$.data[0].publicId").value(orderId.toString()))
                .andExpect(jsonPath("$.data[0].estadoCodigo").value("PAGADO"));
    }

    @Test
    void getOrderReturnsDetailAndTracking() throws Exception {
        UUID orderId = UUID.randomUUID();
        when(getCustomerOrdersUseCase.getOrder(USER_PUBLIC_ID, orderId)).thenReturn(
                new OrderDetailResult(orderId, "ENVIADO", "Enviado", new BigDecimal("125.50"),
                        LocalDateTime.of(2026, 7, 18, 9, 30), "Av. Industrial 100", List.of(), List.of()));

        mockMvc.perform(get("/api/me/orders/{publicId}", orderId)
                        .with(jwt().jwt(token -> token.subject(USER_PUBLIC_ID))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.direccionEntrega").value("Av. Industrial 100"))
                .andExpect(jsonPath("$.data.estadoCodigo").value("ENVIADO"));
    }

    @Test
    void getOrderReturnsNotFoundWithoutExposingAnotherCustomersOrder() throws Exception {
        UUID orderId = UUID.randomUUID();
        when(getCustomerOrdersUseCase.getOrder(any(), any())).thenThrow(new OrderNotFoundException(orderId));

        mockMvc.perform(get("/api/me/orders/{publicId}", orderId)
                        .with(jwt().jwt(token -> token.subject(USER_PUBLIC_ID))))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.errorCode").value("ORDER_NOT_FOUND"));
    }
}
