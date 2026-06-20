package com.integrador.marweld.catalog.api.response;

/**
 * Contrato de salida HTTP que representa una categoría.
 */
public record CategoryResponse(
    Integer idCategoria,
    String nombreCategoria,
    String descripcion,
    String estado
) {}
