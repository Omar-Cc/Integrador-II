package com.integrador.marweld.catalog.application.result;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Representa el resultado interno tras crear un producto en la capa de aplicación.
 */
public record CreateProductResult(
    UUID publicId,
    String nombre,
    String descripcion,
    BigDecimal precio,
    String unidadMedida,
    String estado,
    Integer idCategoria,
    String nombreCategoria
) {}
