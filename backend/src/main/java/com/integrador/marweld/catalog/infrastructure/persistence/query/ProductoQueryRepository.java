package com.integrador.marweld.catalog.infrastructure.persistence.query;

import com.integrador.marweld.catalog.api.request.FiltrosProducto;
import com.integrador.marweld.catalog.infrastructure.persistence.projection.ProductSummaryProjection;
import lombok.RequiredArgsConstructor;
import org.jooq.Condition;
import org.jooq.DSLContext;
import org.jooq.impl.DSL;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import static org.jooq.impl.DSL.field;
import static org.jooq.impl.DSL.lower;
import static org.jooq.impl.DSL.table;
import static org.jooq.impl.DSL.name;

/**
 * Repositorio de consultas dinámicas optimizadas con jOOQ para el catálogo de productos.
 */
@Repository
@RequiredArgsConstructor
public class ProductoQueryRepository {

    private final DSLContext dsl;

    /**
     * Busca y filtra productos del catálogo de acuerdo a los criterios provistos.
     * Consolida la información de productos, inventarios, categorías, especificaciones y relacionados.
     *
     * @param filtros Criterios de filtrado dinámicos.
     * @return Lista de proyecciones de productos.
     */
    public List<ProductSummaryProjection> searchCatalog(FiltrosProducto filtros) {
        // 1. Condición base: Solo productos activos
        Condition condition = field(name("p", "estado")).eq("ACTIVO");

        // 2. Filtro por categoría
        if (filtros.categoria() != null && !filtros.categoria().isBlank()) {
            condition = condition.and(field(name("c", "nombre_categoria"), String.class).equalIgnoreCase(filtros.categoria()));
        }

        // 3. Filtro por precio mínimo
        if (filtros.precioMin() != null) {
            condition = condition.and(field(name("p", "precio"), BigDecimal.class).ge(filtros.precioMin()));
        }

        // 4. Filtro por precio máximo
        if (filtros.precioMax() != null) {
            condition = condition.and(field(name("p", "precio"), BigDecimal.class).le(filtros.precioMax()));
        }

        // 5. Filtro por stock disponible
        if (Boolean.TRUE.equals(filtros.soloDisponibles())) {
            condition = condition.and(field(name("i", "stock_actual"), Integer.class).gt(0));
        }

        // 6. Filtro por marca (buscado en especificaciones del producto)
        if (filtros.marca() != null && !filtros.marca().isBlank()) {
            condition = condition.and(
                field(name("p", "id_producto"), Integer.class).in(
                    dsl.select(field(name("id_producto"), Integer.class))
                       .from(table(name("especificaciones_producto")))
                       .where(field(name("clave")).eq("marca")
                          .and(field(name("valor")).equalIgnoreCase(filtros.marca())))
                )
            );
        }

        // 7. Filtro por término de búsqueda (coincide con nombre, descripción o descripción corta en especificaciones)
        if (filtros.busqueda() != null && !filtros.busqueda().isBlank()) {
            String searchPattern = "%" + filtros.busqueda().toLowerCase() + "%";
            Condition searchCondition = lower(field(name("p", "nombre"), String.class)).like(searchPattern)
                .or(lower(field(name("p", "descripcion"), String.class)).like(searchPattern))
                .or(field(name("p", "id_producto"), Integer.class).in(
                    dsl.select(field(name("id_producto"), Integer.class))
                       .from(table(name("especificaciones_producto")))
                       .where(field(name("clave")).eq("descripcion_corta")
                          .and(lower(field(name("valor"), String.class)).like(searchPattern)))
                ));
            condition = condition.and(searchCondition);
        }

        // 8. Consulta base de productos principales
        List<BaseProduct> baseProducts = dsl.select(
                field(name("p", "id_producto"), Integer.class).as("idProducto"),
                field(name("p", "public_id"), UUID.class).as("publicId"),
                field(name("p", "id_categoria"), Integer.class).as("idCategoria"),
                field(name("p", "nombre"), String.class).as("nombre"),
                field(name("p", "descripcion"), String.class).as("descripcion"),
                field(name("p", "precio"), BigDecimal.class).as("precio"),
                field(name("p", "unidad_medida"), String.class).as("unidadMedida"),
                field(name("p", "estado"), String.class).as("estado"),
                field(name("c", "nombre_categoria"), String.class).as("nombreCategoria"),
                field(name("i", "stock_actual"), Integer.class).as("stockActual")
            )
            .from(table(name("productos")).as(name("p")))
            .join(table(name("categorias")).as(name("c"))).on(field(name("p", "id_categoria")).eq(field(name("c", "id_categoria"))))
            .leftJoin(table(name("inventarios")).as(name("i"))).on(field(name("p", "id_producto")).eq(field(name("i", "id_producto"))))
            .where(condition)
            .fetchInto(BaseProduct.class);

        if (baseProducts.isEmpty()) {
            return List.of();
        }

        // 9. Extraer IDs de productos recuperados para consultas secundarias
        List<Integer> productIds = baseProducts.stream()
            .map(BaseProduct::idProducto)
            .collect(Collectors.toList());

        // 10. Consulta secundaria de especificaciones (por lotes, en 1 query)
        Map<Integer, List<SpecRow>> specsByProductId = dsl.select(
                field(name("id_producto"), Integer.class).as("idProducto"),
                field(name("clave"), String.class).as("clave"),
                field(name("valor"), String.class).as("valor")
            )
            .from(table(name("especificaciones_producto")))
            .where(field(name("id_producto")).in(productIds))
            .fetchInto(SpecRow.class)
            .stream()
            .collect(Collectors.groupingBy(SpecRow::idProducto));

        // 11. Consulta secundaria de productos relacionados (por lotes, en 1 query)
        Map<Integer, List<UUID>> relatedUuidsByProductId = dsl.select(
                field(name("r", "id_producto_origen"), Integer.class).as("idProductoOrigen"),
                field(name("p_dest", "public_id"), UUID.class).as("publicIdDestino")
            )
            .from(table(name("relaciones_producto")).as(name("r")))
            .join(table(name("productos")).as(name("p_dest"))).on(field(name("r", "id_producto_destino")).eq(field(name("p_dest", "id_producto"))))
            .where(field(name("r", "id_producto_origen")).in(productIds))
            .fetch()
            .stream()
            .collect(Collectors.groupingBy(
                record -> record.get("idProductoOrigen", Integer.class),
                Collectors.mapping(record -> record.get("publicIdDestino", UUID.class), Collectors.toList())
            ));

        // 12. Consolidación de datos
        List<ProductSummaryProjection> result = new ArrayList<>();
        for (BaseProduct base : baseProducts) {
            Integer id = base.idProducto();

            // Procesar especificaciones
            List<SpecRow> productSpecs = specsByProductId.getOrDefault(id, List.of());
            String imagen = "";
            String descripcionCorta = "";
            String marca = "";
            boolean destacado = false;
            BigDecimal precioAnterior = null;
            List<ProductSummaryProjection.Feature> caracteristicas = new ArrayList<>();

            for (SpecRow spec : productSpecs) {
                switch (spec.clave()) {
                    case "imagen" -> imagen = spec.valor();
                    case "descripcion_corta" -> descripcionCorta = spec.valor();
                    case "marca" -> marca = spec.valor();
                    case "destacado" -> destacado = Boolean.parseBoolean(spec.valor());
                    case "precio_anterior" -> {
                        try {
                            precioAnterior = new BigDecimal(spec.valor());
                        } catch (Exception e) {
                            precioAnterior = null;
                        }
                    }
                    default -> caracteristicas.add(new ProductSummaryProjection.Feature(spec.clave(), spec.valor()));
                }
            }

            // Obtener relacionados
            List<UUID> relacionados = relatedUuidsByProductId.getOrDefault(id, List.of());

            // Determinar disponibilidad
            int currentStock = base.stockActual() != null ? base.stockActual() : 0;
            boolean disponible = "ACTIVO".equalsIgnoreCase(base.estado()) && currentStock > 0;

            result.add(new ProductSummaryProjection(
                base.publicId(),
                base.nombre(),
                descripcionCorta,
                base.descripcion(),
                base.precio(),
                precioAnterior,
                imagen,
                base.unidadMedida(),
                base.estado(),
                base.nombreCategoria(),
                marca,
                disponible,
                currentStock,
                destacado,
                caracteristicas,
                relacionados,
                
                // Campos de compatibilidad
                base.descripcion(),
                base.idCategoria(),
                base.nombreCategoria(),
                currentStock
            ));
        }

        return result;
    }

    /**
     * Recupera la proyección de catálogo completa para un producto por su publicId.
     *
     * @param publicId UUID público del producto.
     * @return Proyección de catálogo o null si no se encuentra.
     */
    public ProductSummaryProjection getProductByPublicId(UUID publicId) {
        Condition condition = field(name("p", "public_id")).eq(publicId);

        List<BaseProduct> baseProducts = dsl.select(
                field(name("p", "id_producto"), Integer.class).as("idProducto"),
                field(name("p", "public_id"), UUID.class).as("publicId"),
                field(name("p", "id_categoria"), Integer.class).as("idCategoria"),
                field(name("p", "nombre"), String.class).as("nombre"),
                field(name("p", "descripcion"), String.class).as("descripcion"),
                field(name("p", "precio"), BigDecimal.class).as("precio"),
                field(name("p", "unidad_medida"), String.class).as("unidadMedida"),
                field(name("p", "estado"), String.class).as("estado"),
                field(name("c", "nombre_categoria"), String.class).as("nombreCategoria"),
                field(name("i", "stock_actual"), Integer.class).as("stockActual")
            )
            .from(table(name("productos")).as(name("p")))
            .join(table(name("categorias")).as(name("c"))).on(field(name("p", "id_categoria")).eq(field(name("c", "id_categoria"))))
            .leftJoin(table(name("inventarios")).as(name("i"))).on(field(name("p", "id_producto")).eq(field(name("i", "id_producto"))))
            .where(condition)
            .fetchInto(BaseProduct.class);

        if (baseProducts.isEmpty()) {
            return null;
        }

        BaseProduct base = baseProducts.get(0);
        Integer id = base.idProducto();

        // Consulta secundaria de especificaciones para este producto
        List<SpecRow> productSpecs = dsl.select(
                field(name("id_producto"), Integer.class).as("idProducto"),
                field(name("clave"), String.class).as("clave"),
                field(name("valor"), String.class).as("valor")
            )
            .from(table(name("especificaciones_producto")))
            .where(field(name("id_producto")).eq(id))
            .fetchInto(SpecRow.class);

        // Consulta secundaria de productos relacionados
        List<UUID> relacionados = dsl.select(
                field(name("p_dest", "public_id"), UUID.class).as("publicIdDestino")
            )
            .from(table(name("relaciones_producto")).as(name("r")))
            .join(table(name("productos")).as(name("p_dest"))).on(field(name("r", "id_producto_destino")).eq(field(name("p_dest", "id_producto"))))
            .where(field(name("r", "id_producto_origen")).eq(id))
            .fetch()
            .map(record -> record.get("publicIdDestino", UUID.class));

        // Procesar especificaciones
        String imagen = "";
        String descripcionCorta = "";
        String marca = "";
        boolean destacado = false;
        BigDecimal precioAnterior = null;
        List<ProductSummaryProjection.Feature> caracteristicas = new ArrayList<>();

        for (SpecRow spec : productSpecs) {
            switch (spec.clave()) {
                case "imagen" -> imagen = spec.valor();
                case "descripcion_corta" -> descripcionCorta = spec.valor();
                case "marca" -> marca = spec.valor();
                case "destacado" -> destacado = Boolean.parseBoolean(spec.valor());
                case "precio_anterior" -> {
                    try {
                        precioAnterior = new BigDecimal(spec.valor());
                    } catch (Exception e) {
                        precioAnterior = null;
                    }
                }
                default -> caracteristicas.add(new ProductSummaryProjection.Feature(spec.clave(), spec.valor()));
            }
        }

        // Determinar disponibilidad
        int currentStock = base.stockActual() != null ? base.stockActual() : 0;
        boolean disponible = "ACTIVO".equalsIgnoreCase(base.estado()) && currentStock > 0;

        return new ProductSummaryProjection(
            base.publicId(),
            base.nombre(),
            descripcionCorta,
            base.descripcion(),
            base.precio(),
            precioAnterior,
            imagen,
            base.unidadMedida(),
            base.estado(),
            base.nombreCategoria(),
            marca,
            disponible,
            currentStock,
            destacado,
            caracteristicas,
            relacionados,
            base.descripcion(),
            base.idCategoria(),
            base.nombreCategoria(),
            currentStock
        );
    }

    /**
     * Record interno para almacenar los datos planos del producto de la query base.
     */
    private record BaseProduct(
        Integer idProducto,
        UUID publicId,
        Integer idCategoria,
        String nombre,
        String descripcion,
        BigDecimal precio,
        String unidadMedida,
        String estado,
        String nombreCategoria,
        Integer stockActual
    ) {}

    /**
     * Record interno para almacenar una especificación técnica de la query secundaria.
     */
    private record SpecRow(
        Integer idProducto,
        String clave,
        String valor
    ) {}
}
