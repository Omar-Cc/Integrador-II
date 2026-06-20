package com.integrador.marweld.catalog.infrastructure.persistence.projection;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * Proyección (Read Model) optimizada para el catálogo de productos de Marweld.
 * Incorpora campos de compatibilidad con ProductResponse para evitar efectos colaterales en la API.
 */
public record ProductSummaryProjection(
    UUID publicId,
    String nombre,
    String descripcionCorta,
    String descripcionLarga,
    BigDecimal precio,
    BigDecimal precioAnterior,
    String imagen,
    String unidadMedida,
    String estado,
    String categoria,
    String marca,
    boolean disponible,
    int stock,
    boolean destacado,
    List<Feature> caracteristicas,
    List<UUID> relacionados,
    
    // Campos de compatibilidad hacia atrás con ProductResponse
    String descripcion,
    Integer idCategoria,
    String nombreCategoria,
    Integer stockActual
) {
    /**
     * Característica técnica individual de un producto.
     */
    public record Feature(String label, String valor) {}
}
