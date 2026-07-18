package com.integrador.marweld.orders.application.result;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record OrderSummaryResult(
        UUID publicId,
        String estadoCodigo,
        String estadoNombre,
        BigDecimal total,
        LocalDateTime fechaPedido,
        int cantidadProductos
) { }
