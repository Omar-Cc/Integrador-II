package com.integrador.marweld.orders.application.result;

import java.time.LocalDateTime;

public record OrderTrackingResult(
        String estadoCodigo,
        String titulo,
        String descripcion,
        String ubicacion,
        LocalDateTime fechaEvento
) { }
