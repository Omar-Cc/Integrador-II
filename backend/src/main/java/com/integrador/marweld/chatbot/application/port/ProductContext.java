package com.integrador.marweld.chatbot.application.port;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Snapshot de producto que el chatbot puede usar sin depender del modulo catalog.
 */
public record ProductContext(
        Integer idProducto,
        UUID publicId,
        String nombre,
        String descripcion,
        BigDecimal precio,
        String unidadMedida,
        String estado,
        String categoria,
        String marca,
        int stock
) {}