package com.integrador.marweld.catalog.api.mapper;

import com.integrador.marweld.catalog.api.request.CreateProductRequest;
import com.integrador.marweld.catalog.api.response.CategoryResponse;
import com.integrador.marweld.catalog.api.response.ProductResponse;
import com.integrador.marweld.catalog.application.command.CreateProductCommand;
import com.integrador.marweld.catalog.application.result.CreateProductResult;
import com.integrador.marweld.catalog.domain.model.Categoria;
import com.integrador.marweld.catalog.domain.model.Producto;
import org.springframework.stereotype.Component;

/**
 * Mapeador que traduce DTOs de entrada y salida HTTP a comandos y resultados internos de aplicación.
 */
@Component
public class CatalogApiMapper {

    /**
     * Mapea un request de creación de producto a su comando interno correspondiente.
     */
    public CreateProductCommand toCommand(CreateProductRequest request) {
        return new CreateProductCommand(
                request.idCategoria(),
                request.nombre(),
                request.descripcion(),
                request.precio(),
                request.unidadMedida()
        );
    }

    /**
     * Mapea el resultado de la creación de un producto a su respuesta HTTP, inyectando el stock actual.
     */
    public ProductResponse toResponse(CreateProductResult result, Integer stockActual) {
        return new ProductResponse(
                result.publicId(),
                result.nombre(),
                result.descripcion(),
                result.precio(),
                result.unidadMedida(),
                result.estado(),
                result.idCategoria(),
                result.nombreCategoria(),
                stockActual
        );
    }

    /**
     * Mapea la entidad de dominio Producto a su respuesta HTTP, inyectando el stock actual.
     */
    public ProductResponse toResponse(Producto producto, Integer stockActual) {
        return new ProductResponse(
                producto.getPublicId(),
                producto.getNombre(),
                producto.getDescripcion(),
                producto.getPrecio(),
                producto.getUnidadMedida(),
                producto.getEstado(),
                producto.getCategoria().getIdCategoria(),
                producto.getCategoria().getNombreCategoria(),
                stockActual
        );
    }

    /**
     * Mapea la entidad de dominio Categoría a su respuesta HTTP.
     */
    public CategoryResponse toResponse(Categoria categoria) {
        return new CategoryResponse(
                categoria.getIdCategoria(),
                categoria.getNombreCategoria(),
                categoria.getDescripcion(),
                categoria.getEstado()
        );
    }
}
