package com.integrador.marweld.orders.infrastructure.persistence.projection;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record OrderSummaryProjection(
        UUID publicId,
        String estadoCodigo,
        String estadoNombre,
        BigDecimal total,
        LocalDateTime fechaPedido,
        Integer cantidadProductos
) { }
