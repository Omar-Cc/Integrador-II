package com.integrador.marweld.orders.application.result;

import java.math.BigDecimal;
import java.util.UUID;

public record OrderItemResult(
        UUID productoPublicId,
        String nombre,
        int cantidad,
        BigDecimal precioUnitario,
        BigDecimal subtotal
) { }
