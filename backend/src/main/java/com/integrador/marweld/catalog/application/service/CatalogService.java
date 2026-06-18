package com.integrador.marweld.catalog.application.service;

import com.integrador.marweld.catalog.application.command.CreateProductCommand;
import com.integrador.marweld.catalog.application.result.CreateProductResult;
import com.integrador.marweld.catalog.domain.model.Categoria;
import com.integrador.marweld.catalog.domain.model.Producto;

import java.util.List;
import java.util.UUID;

/**
 * Interfaz de servicio de fachada para el módulo de catálogo.
 */
public interface CatalogService {

    /**
     * Registra un nuevo producto delegando en el caso de uso correspondiente.
     *
     * @param command Comando con los datos del producto.
     * @return Resultado de la creación.
     */
    CreateProductResult createProduct(CreateProductCommand command);

    /**
     * Busca un producto activo por su identificador público UUID.
     *
     * @param publicId Identificador UUID público.
     * @return Producto encontrado.
     */
    Producto getProductByPublicId(UUID publicId);

    /**
     * Obtiene todos los productos con estado ACTIVO.
     *
     * @return Lista de productos activos.
     */
    List<Producto> getAllActiveProducts();

    /**
     * Registra una nueva categoría en el sistema.
     *
     * @param nombreCategoria Nombre único de la categoría.
     * @param descripcion Descripción de la categoría.
     * @return Categoría creada.
     */
    Categoria createCategory(String nombreCategoria, String descripcion);

    /**
     * Obtiene todas las categorías con estado ACTIVO.
     *
     * @return Lista de categorías activas.
     */
    List<Categoria> getAllActiveCategories();

    /**
     * Obtiene el stock actual de un producto.
     *
     * @param idProducto ID interno del producto.
     * @return Cantidad de stock actual (por defecto 0 si no existe registro).
     */
    Integer getStockActual(Integer idProducto);
}
