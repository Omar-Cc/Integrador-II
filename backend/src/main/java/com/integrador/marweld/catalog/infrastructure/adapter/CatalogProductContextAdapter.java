package com.integrador.marweld.catalog.infrastructure.adapter;

import com.integrador.marweld.catalog.domain.model.EspecificacionProducto;
import com.integrador.marweld.catalog.domain.model.Producto;
import com.integrador.marweld.catalog.infrastructure.persistence.repository.EspecificacionProductoRepository;
import com.integrador.marweld.catalog.infrastructure.persistence.repository.InventarioRepository;
import com.integrador.marweld.catalog.infrastructure.persistence.repository.ProductoRepository;
import com.integrador.marweld.catalog.infrastructure.persistence.query.ProductSemanticQueryRepository;
import com.integrador.marweld.chatbot.application.port.ProductContext;
import com.integrador.marweld.chatbot.application.port.ProductContextPort;
import com.integrador.marweld.chatbot.infrastructure.adapter.EmbeddingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Adapter de catalogo para entregar contexto de productos al chatbot.
 */
@Component
@RequiredArgsConstructor
public class CatalogProductContextAdapter implements ProductContextPort {

    private final ProductoRepository productoRepository;
    private final InventarioRepository inventarioRepository;
    private final EspecificacionProductoRepository especificacionProductoRepository;
    private final EmbeddingService embeddingService;
    private final ProductSemanticQueryRepository productSemanticQueryRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ProductContext> findActiveProductsByKeywords(List<String> keywords) {
        if (keywords == null || keywords.isEmpty()) {
            return List.of();
        }

        Map<Integer, Producto> productsById = new LinkedHashMap<>();

        // La búsqueda vectorial cubre plurales, sinónimos y consultas expresadas
        // de forma natural. La coincidencia textual se conserva como respaldo para
        // códigos, medidas y marcas técnicas (por ejemplo, E6013 o ER70S-6).
        List<Double> embedding = embeddingService.getEmbedding(String.join(" ", keywords));
        if (embedding.size() == 768) {
            try {
                productSemanticQueryRepository.findNearestActiveProductIds(embedding.toString(), 5).stream()
                        .map(productoRepository::findById)
                        .flatMap(java.util.Optional::stream)
                        .forEach(product -> productsById.putIfAbsent(product.getIdProducto(), product));
            } catch (Exception ex) {
                // La conversación debe continuar con el respaldo textual si la
                // migración o los embeddings aún no están disponibles.
            }
        }

        for (String keyword : keywords) {
            productoRepository.findByNombreContainingIgnoreCaseAndEstado(keyword, "ACTIVO")
                    .forEach(product -> productsById.putIfAbsent(product.getIdProducto(), product));
        }

        return productsById.values().stream()
                .map(this::toContext)
                .toList();
    }

    private ProductContext toContext(Producto product) {
        String marca = especificacionProductoRepository.findByProductoIdProducto(product.getIdProducto()).stream()
                .filter(spec -> "marca".equalsIgnoreCase(spec.getClave()))
                .map(EspecificacionProducto::getValor)
                .findFirst()
                .orElse("Generica");
        int stock = inventarioRepository.findByProductoIdProducto(product.getIdProducto())
                .map(inventory -> inventory.getStockActual() != null ? inventory.getStockActual() : 0)
                .orElse(0);

        return new ProductContext(
                product.getIdProducto(),
                product.getPublicId(),
                product.getNombre(),
                product.getDescripcion(),
                product.getPrecio(),
                product.getUnidadMedida(),
                product.getEstado(),
                product.getCategoria().getNombreCategoria(),
                marca,
                stock
        );
    }
}
