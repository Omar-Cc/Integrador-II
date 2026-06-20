package com.integrador.marweld.catalog.api.response;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Contrato de salida HTTP que representa la información pública de un producto.
 */
public record ProductResponse(
    UUID publicId,
    String nombre,
    String descripcion,
    BigDecimal precio,
    String unidadMedida,
    String estado,
    Integer idCategoria,
    String nombreCategoria,
    Integer stockActual
) {}
