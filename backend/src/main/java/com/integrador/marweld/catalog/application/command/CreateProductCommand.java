package com.integrador.marweld.catalog.application.command;

import java.math.BigDecimal;

/**
 * Representa el comando interno para registrar un producto en la capa de aplicación.
 */
public record CreateProductCommand(
    Integer idCategoria,
    String nombre,
    String descripcion,
    BigDecimal precio,
    String unidadMedida
) {}
