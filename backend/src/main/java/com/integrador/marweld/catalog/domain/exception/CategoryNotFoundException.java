package com.integrador.marweld.catalog.domain.exception;

import com.integrador.marweld.core.exception.NotFoundException;

/**
 * Excepción lanzada cuando una categoría no es encontrada.
 */
public class CategoryNotFoundException extends NotFoundException {
    public CategoryNotFoundException(Integer id) {
        super("La categoría con ID " + id + " no fue encontrada.", "CATEGORY_NOT_FOUND");
    }
}
