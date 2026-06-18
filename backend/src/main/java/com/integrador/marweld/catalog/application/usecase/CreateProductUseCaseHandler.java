package com.integrador.marweld.catalog.application.usecase;

import com.integrador.marweld.catalog.application.command.CreateProductCommand;
import com.integrador.marweld.catalog.application.result.CreateProductResult;
import com.integrador.marweld.catalog.domain.exception.CategoryNotFoundException;
import com.integrador.marweld.catalog.domain.model.Categoria;
import com.integrador.marweld.catalog.domain.model.Inventario;
import com.integrador.marweld.catalog.domain.model.Producto;
import com.integrador.marweld.catalog.infrastructure.persistence.repository.CategoriaRepository;
import com.integrador.marweld.catalog.infrastructure.persistence.repository.InventarioRepository;
import com.integrador.marweld.catalog.infrastructure.persistence.repository.ProductoRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Implementación del caso de uso para crear un producto.
 * Valida la existencia de la categoría y crea de forma transaccional tanto el producto como su inventario asociado.
 */
@Component
public class CreateProductUseCaseHandler implements CreateProductUseCase {

    private static final Logger log = LoggerFactory.getLogger(CreateProductUseCaseHandler.class);

    private final CategoriaRepository categoriaRepository;
    private final ProductoRepository productoRepository;
    private final InventarioRepository inventarioRepository;

    public CreateProductUseCaseHandler(
            CategoriaRepository categoriaRepository,
            ProductoRepository productoRepository,
            InventarioRepository inventarioRepository) {
        this.categoriaRepository = categoriaRepository;
        this.productoRepository = productoRepository;
        this.inventarioRepository = inventarioRepository;
    }

    @Override
    @Transactional
    public CreateProductResult handle(CreateProductCommand command) {
        log.info("Iniciando creación de producto: {} en categoría ID: {}", command.nombre(), command.idCategoria());

        // 1. Validar que la categoría exista
        Categoria categoria = categoriaRepository.findById(command.idCategoria())
                .orElseThrow(() -> {
                    log.warn("Creación fallida: Categoría con ID {} no encontrada", command.idCategoria());
                    return new CategoryNotFoundException(command.idCategoria());
                });

        // 2. Crear y guardar el Producto
        Producto producto = Producto.builder()
                .categoria(categoria)
                .nombre(command.nombre())
                .descripcion(command.descripcion())
                .precio(command.precio())
                .unidadMedida(command.unidadMedida())
                .estado("ACTIVO")
                .build();

        producto = productoRepository.save(producto);
        log.debug("Producto guardado exitosamente con ID: {} y publicId: {}", producto.getIdProducto(), producto.getPublicId());

        // 3. Crear e inicializar el Inventario para el producto con stock 0
        Inventario inventario = Inventario.builder()
                .producto(producto)
                .stockActual(0)
                .stockMinimo(0)
                .fechaActualizacion(LocalDateTime.now())
                .build();

        inventarioRepository.save(inventario);
        log.debug("Registro de inventario inicializado para el producto ID: {}", producto.getIdProducto());

        log.info("Producto creado de manera exitosa con publicId: {}", producto.getPublicId());

        return new CreateProductResult(
                producto.getPublicId(),
                producto.getNombre(),
                producto.getDescripcion(),
                producto.getPrecio(),
                producto.getUnidadMedida(),
                producto.getEstado(),
                categoria.getIdCategoria(),
                categoria.getNombreCategoria()
        );
    }
}
