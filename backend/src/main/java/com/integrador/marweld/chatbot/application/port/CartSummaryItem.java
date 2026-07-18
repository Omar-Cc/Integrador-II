package com.integrador.marweld.chatbot.application.port;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Item resumido del carrito expuesto al chatbot.
 */
public record CartSummaryItem(
        UUID productPublicId,
        String nombre,
        int cantidad,
        BigDecimal precioUnitario,
        BigDecimal subtotal
) {}
