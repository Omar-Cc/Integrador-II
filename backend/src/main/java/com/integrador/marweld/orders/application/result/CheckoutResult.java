package com.integrador.marweld.orders.application.result;

import java.math.BigDecimal;
import java.util.UUID;

public record CheckoutResult(
        UUID orderPublicId,
        UUID paymentPublicId,
        boolean paymentApproved,
        String orderStatus,
        String paymentStatus,
        BigDecimal total
) { }
