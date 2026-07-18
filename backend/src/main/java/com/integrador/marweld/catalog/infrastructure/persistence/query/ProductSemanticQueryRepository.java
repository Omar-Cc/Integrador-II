package com.integrador.marweld.catalog.infrastructure.persistence.query;

import lombok.RequiredArgsConstructor;
import org.jooq.DSLContext;
import org.jooq.Field;
import org.jooq.Table;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

import static org.jooq.impl.DSL.field;
import static org.jooq.impl.DSL.name;
import static org.jooq.impl.DSL.table;
import static org.jooq.impl.DSL.val;

/** Consultas pgvector del catálogo implementadas con jOOQ. */
@Repository
@RequiredArgsConstructor
public class ProductSemanticQueryRepository {

    private static final Table<?> PRODUCTOS = table(name("productos"));
    private static final Field<Integer> ID_PRODUCTO = field(name("id_producto"), Integer.class);
    private static final Field<String> ESTADO = field(name("estado"), String.class);
    private static final Field<Object> EMBEDDING = field(name("embedding"));

    private final DSLContext dsl;

    /** Obtiene los IDs de los productos activos con menor distancia de coseno. */
    public List<Integer> findNearestActiveProductIds(String embeddingVector, int limit) {
        Field<BigDecimal> cosineDistance = field(
                "{0} <=> cast({1} as vector)", BigDecimal.class, EMBEDDING, val(embeddingVector));

        return dsl.select(ID_PRODUCTO)
                .from(PRODUCTOS)
                .where(ESTADO.eq("ACTIVO").and(EMBEDDING.isNotNull()))
                .orderBy(cosineDistance.asc())
                .limit(limit)
                .fetch(ID_PRODUCTO);
    }

    /** Obtiene IDs activos que todavía no tienen un vector almacenado. */
    public List<Integer> findActiveProductIdsWithoutEmbedding() {
        return dsl.select(ID_PRODUCTO)
                .from(PRODUCTOS)
                .where(ESTADO.eq("ACTIVO").and(EMBEDDING.isNull()))
                .fetch(ID_PRODUCTO);
    }

    /** Actualiza el vector usando el tipo pgvector sin requerir un mapeo JPA. */
    public void updateEmbedding(Integer productId, String embeddingVector) {
        dsl.query("UPDATE {0} SET {1} = cast({2} as vector) WHERE {3} = {4}",
                        PRODUCTOS, EMBEDDING, val(embeddingVector), ID_PRODUCTO, val(productId))
                .execute();
    }
}
