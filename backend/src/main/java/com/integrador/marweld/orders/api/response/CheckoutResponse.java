package com.integrador.marweld.orders.api.response;

import java.math.BigDecimal;
import java.util.UUID;

public record CheckoutResponse(
        UUID orderPublicId,
        UUID paymentPublicId,
        boolean paymentApproved,
        String orderStatus,
        String paymentStatus,
        BigDecimal total,
        String message
) { }
