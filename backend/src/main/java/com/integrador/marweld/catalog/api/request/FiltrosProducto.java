package com.integrador.marweld.catalog.api.request;

import java.math.BigDecimal;

/**
 * Filtros de búsqueda y catálogo enviados desde el frontend.
 */
public record FiltrosProducto(
    String categoria,
    String marca,
    BigDecimal precioMin,
    BigDecimal precioMax,
    Boolean soloDisponibles,
    String busqueda
) {}
