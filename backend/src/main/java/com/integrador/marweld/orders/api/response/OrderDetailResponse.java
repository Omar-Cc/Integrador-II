package com.integrador.marweld.orders.api.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record OrderDetailResponse(
        UUID publicId,
        String estadoCodigo,
        String estadoNombre,
        BigDecimal total,
        LocalDateTime fechaPedido,
        String direccionEntrega,
        List<OrderItemResponse> productos,
        List<OrderTrackingResponse> seguimiento
) { }
