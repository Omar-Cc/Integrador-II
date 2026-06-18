package com.integrador.marweld.catalog.application.service;

import com.integrador.marweld.catalog.application.command.CreateProductCommand;
import com.integrador.marweld.catalog.application.result.CreateProductResult;
import com.integrador.marweld.catalog.application.usecase.CreateProductUseCase;
import com.integrador.marweld.catalog.domain.exception.ProductNotFoundException;
import com.integrador.marweld.catalog.domain.model.Categoria;
import com.integrador.marweld.catalog.domain.model.Inventario;
import com.integrador.marweld.catalog.domain.model.Producto;
import com.integrador.marweld.catalog.infrastructure.persistence.repository.CategoriaRepository;
import com.integrador.marweld.catalog.infrastructure.persistence.repository.InventarioRepository;
import com.integrador.marweld.catalog.infrastructure.persistence.repository.ProductoRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Implementación del servicio de fachada CatalogService.
 */
@Service
public class CatalogServiceImpl implements CatalogService {

    private static final Logger log = LoggerFactory.getLogger(CatalogServiceImpl.class);

    private final CreateProductUseCase createProductUseCase;
    private final ProductoRepository productoRepository;
    private final CategoriaRepository categoriaRepository;
    private final InventarioRepository inventarioRepository;

    public CatalogServiceImpl(
            CreateProductUseCase createProductUseCase,
            ProductoRepository productoRepository,
            CategoriaRepository categoriaRepository,
            InventarioRepository inventarioRepository) {
        this.createProductUseCase = createProductUseCase;
        this.productoRepository = productoRepository;
        this.categoriaRepository = categoriaRepository;
        this.inventarioRepository = inventarioRepository;
    }

    @Override
    @Transactional
    public CreateProductResult createProduct(CreateProductCommand command) {
        return createProductUseCase.handle(command);
    }

    @Override
    @Transactional(readOnly = true)
    public Producto getProductByPublicId(UUID publicId) {
        log.debug("Buscando producto por publicId: {}", publicId);
        return productoRepository.findByPublicId(publicId)
                .filter(p -> "ACTIVO".equals(p.getEstado()))
                .orElseThrow(() -> {
                    log.warn("Producto con publicId {} no encontrado o inactivo", publicId);
                    return new ProductNotFoundException(publicId);
                });
    }

    @Override
    @Transactional(readOnly = true)
    public List<Producto> getAllActiveProducts() {
        log.debug("Obteniendo todos los productos activos");
        return productoRepository.findByEstado("ACTIVO");
    }

    @Override
    @Transactional
    public Categoria createCategory(String nombreCategoria, String descripcion) {
        log.info("Creando nueva categoría: {}", nombreCategoria);
        Categoria categoria = Categoria.builder()
                .nombreCategoria(nombreCategoria.trim())
                .descripcion(descripcion != null ? descripcion.trim() : null)
                .estado("ACTIVO")
                .build();
        return categoriaRepository.save(categoria);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Categoria> getAllActiveCategories() {
        log.debug("Obteniendo todas las categorías activas");
        return categoriaRepository.findByEstado("ACTIVO");
    }

    @Override
    @Transactional(readOnly = true)
    public Integer getStockActual(Integer idProducto) {
        return inventarioRepository.findByProductoIdProducto(idProducto)
                .map(Inventario::getStockActual)
                .orElse(0);
    }
}
