package com.integrador.marweld.catalog.application.usecase;

import com.integrador.marweld.catalog.application.command.CreateProductCommand;
import com.integrador.marweld.catalog.application.result.CreateProductResult;

/**
 * Interfaz que define el caso de uso para crear un nuevo producto.
 */
public interface CreateProductUseCase {
    CreateProductResult handle(CreateProductCommand command);
}
