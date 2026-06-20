package com.integrador.marweld.catalog.api.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

/**
 * Contrato de entrada HTTP para registrar un nuevo producto.
 */
public record CreateProductRequest(
    @NotNull(message = "El ID de categoría es obligatorio.")
    Integer idCategoria,

    @NotBlank(message = "El nombre es obligatorio.")
    @Size(max = 180, message = "El nombre no puede exceder los 180 caracteres.")
    String nombre,

    String descripcion,

    @NotNull(message = "El precio es obligatorio.")
    @PositiveOrZero(message = "El precio no puede ser negativo.")
    BigDecimal precio,

    @NotBlank(message = "La unidad de medida es obligatoria.")
    @Size(max = 40, message = "La unidad de medida no puede exceder los 40 caracteres.")
    String unidadMedida
) {}
