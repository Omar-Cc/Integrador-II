package com.integrador.marweld.orders.infrastructure.persistence.projection;

import com.integrador.marweld.orders.application.result.OrderItemResult;
import com.integrador.marweld.orders.application.result.OrderTrackingResult;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record OrderDetailProjection(
        UUID publicId,
        String estadoCodigo,
        String estadoNombre,
        BigDecimal total,
        LocalDateTime fechaPedido,
        String direccionEntrega,
        List<OrderItemResult> productos,
        List<OrderTrackingResult> seguimiento
) { }
