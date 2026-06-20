package com.integrador.marweld.catalog.api.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Contrato de entrada HTTP para registrar una nueva categoría.
 */
public record CreateCategoryRequest(
    @NotBlank(message = "El nombre de categoría es obligatorio.")
    @Size(max = 120, message = "El nombre de categoría no puede exceder los 120 caracteres.")
    String nombreCategoria,

    String descripcion
) {}
