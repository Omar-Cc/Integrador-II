package com.integrador.marweld.catalog.application.service;

import com.integrador.marweld.catalog.application.command.CreateProductCommand;
import com.integrador.marweld.catalog.application.result.CreateProductResult;
import com.integrador.marweld.catalog.api.request.FiltrosProducto;
import com.integrador.marweld.catalog.domain.model.Categoria;
import com.integrador.marweld.catalog.domain.model.Producto;
import com.integrador.marweld.catalog.infrastructure.persistence.projection.ProductSummaryProjection;

import java.util.List;
import java.util.UUID;

/**
 * Interfaz de servicio de fachada para el módulo de catálogo.
 */
public interface CatalogService {

    /**
     * Busca y filtra los productos de catálogo para mostrar en el e-commerce.
     *
     * @param filtros Filtros dinámicos de búsqueda.
     * @return Lista de proyecciones de catálogo de productos.
     */
    List<ProductSummaryProjection> searchCatalog(FiltrosProducto filtros);

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
     * Obtiene la proyección enriquecida de catálogo para un producto por su UUID público.
     *
     * @param publicId Identificador UUID público.
     * @return Proyección de catálogo o null si no se encuentra.
     */
    ProductSummaryProjection getProductProjectionByPublicId(UUID publicId);

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
