package com.integrador.marweld.catalog.domain.exception;

import com.integrador.marweld.core.exception.NotFoundException;
import java.util.UUID;

/**
 * Excepción lanzada cuando un producto no es encontrado.
 */
public class ProductNotFoundException extends NotFoundException {
    public ProductNotFoundException(UUID publicId) {
        super("El producto con ID público " + publicId + " no fue encontrado.", "PRODUCT_NOT_FOUND");
    }
}
