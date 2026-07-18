package com.integrador.marweld.orders.api.response;

import java.time.LocalDateTime;

public record OrderTrackingResponse(
        String estadoCodigo,
        String titulo,
        String descripcion,
        String ubicacion,
        LocalDateTime fechaEvento
) { }
