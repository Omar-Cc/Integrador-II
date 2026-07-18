package com.integrador.marweld.catalog.infrastructure.service;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

/** Completa los vectores faltantes tras aplicar la migración. */
@Component
@RequiredArgsConstructor
public class ProductEmbeddingBackfillRunner implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(ProductEmbeddingBackfillRunner.class);

    private final ProductEmbeddingService productEmbeddingService;

    @Override
    public void run(ApplicationArguments args) {
        try {
            int generated = productEmbeddingService.backfillMissingActiveProducts();
            log.info("product_embedding_backfill_completed generated={}", generated);
        } catch (Exception ex) {
            // No se debe impedir el arranque si Supabase aún no aplicó la V6.
            log.warn("product_embedding_backfill_skipped message={}", ex.getMessage());
        }
    }
}
