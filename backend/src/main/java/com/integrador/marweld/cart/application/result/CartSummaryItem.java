package com.integrador.marweld.cart.application.result;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Item resumido de carrito para consumidores internos.
 */
public record CartSummaryItem(
        UUID productPublicId,
        String nombre,
        int cantidad,
        BigDecimal precioUnitario,
        BigDecimal subtotal
) {}
