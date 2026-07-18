package com.integrador.marweld.orders.application.result;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record OrderDetailResult(
        UUID publicId,
        String estadoCodigo,
        String estadoNombre,
        BigDecimal total,
        LocalDateTime fechaPedido,
        String direccionEntrega,
        List<OrderItemResult> productos,
        List<OrderTrackingResult> seguimiento
) { }
