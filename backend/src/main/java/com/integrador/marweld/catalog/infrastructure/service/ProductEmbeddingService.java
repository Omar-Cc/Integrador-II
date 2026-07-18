package com.integrador.marweld.catalog.infrastructure.service;

import com.integrador.marweld.catalog.domain.model.EspecificacionProducto;
import com.integrador.marweld.catalog.domain.model.Producto;
import com.integrador.marweld.catalog.infrastructure.persistence.repository.EspecificacionProductoRepository;
import com.integrador.marweld.catalog.infrastructure.persistence.repository.ProductoRepository;
import com.integrador.marweld.catalog.infrastructure.persistence.query.ProductSemanticQueryRepository;
import com.integrador.marweld.chatbot.infrastructure.adapter.EmbeddingService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/** Genera y mantiene los embeddings de los productos del catálogo. */
@Service
@RequiredArgsConstructor
public class ProductEmbeddingService {

    private static final Logger log = LoggerFactory.getLogger(ProductEmbeddingService.class);
    private static final int EMBEDDING_DIMENSIONS = 768;

    private final ProductoRepository productoRepository;
    private final EspecificacionProductoRepository especificacionProductoRepository;
    private final EmbeddingService embeddingService;
    private final ProductSemanticQueryRepository productSemanticQueryRepository;

    /** Vectoriza todos los productos activos que todavía no tienen embedding. */
    @Transactional
    public int backfillMissingActiveProducts() {
        int generated = 0;
        for (Integer productId : productSemanticQueryRepository.findActiveProductIdsWithoutEmbedding()) {
            Producto product = productoRepository.findById(productId).orElse(null);
            if (product == null) {
                continue;
            }
            if (generateFor(product)) {
                generated++;
            }
        }
        return generated;
    }

    /**
     * Genera el vector de un producto. Devuelve false si Gemini o pgvector no
     * están disponibles; el producto queda pendiente para un reintento futuro.
     */
    @Transactional
    public boolean generateFor(Producto product) {
        try {
            List<Double> embedding = embeddingService.getEmbedding(buildSearchableText(product));
            if (embedding.size() != EMBEDDING_DIMENSIONS) {
                log.warn("product_embedding_not_generated productId={} dimensions={}",
                        product.getIdProducto(), embedding.size());
                return false;
            }
            productSemanticQueryRepository.updateEmbedding(product.getIdProducto(), embedding.toString());
            log.info("product_embedding_generated productId={}", product.getIdProducto());
            return true;
        } catch (Exception ex) {
            log.warn("product_embedding_generation_failed productId={} message={}",
                    product.getIdProducto(), ex.getMessage());
            return false;
        }
    }

    private String buildSearchableText(Producto product) {
        StringBuilder text = new StringBuilder();
        append(text, "Producto", product.getNombre());
        append(text, "Descripción", product.getDescripcion());
        if (product.getCategoria() != null) {
            append(text, "Categoría", product.getCategoria().getNombreCategoria());
        }
        append(text, "Unidad", product.getUnidadMedida());
        for (EspecificacionProducto specification :
                especificacionProductoRepository.findByProductoIdProducto(product.getIdProducto())) {
            append(text, specification.getClave(), specification.getValor());
        }
        return text.toString();
    }

    private void append(StringBuilder text, String label, String value) {
        if (value != null && !value.isBlank()) {
            text.append(label).append(": ").append(value).append('\n');
        }
    }
}
