package com.integrador.marweld.orders.api.response;

import java.math.BigDecimal;
import java.util.UUID;

public record OrderItemResponse(
        UUID productoPublicId,
        String nombre,
        int cantidad,
        BigDecimal precioUnitario,
        BigDecimal subtotal
) { }
