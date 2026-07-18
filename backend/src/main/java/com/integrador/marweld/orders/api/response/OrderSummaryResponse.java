package com.integrador.marweld.orders.api.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record OrderSummaryResponse(
        UUID publicId,
        String estadoCodigo,
        String estadoNombre,
        BigDecimal total,
        LocalDateTime fechaPedido,
        int cantidadProductos
) { }
