package com.integrador.marweld.orders.infrastructure.persistence.query;

import com.integrador.marweld.orders.application.result.OrderItemResult;
import com.integrador.marweld.orders.application.result.OrderTrackingResult;
import com.integrador.marweld.orders.infrastructure.persistence.projection.OrderDetailProjection;
import com.integrador.marweld.orders.infrastructure.persistence.projection.OrderSummaryProjection;
import org.jooq.DSLContext;
import org.jooq.impl.DSL;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.jooq.impl.DSL.countDistinct;
import static org.jooq.impl.DSL.field;
import static org.jooq.impl.DSL.name;
import static org.jooq.impl.DSL.table;

@Repository
public class OrderQueryRepository {
    private final DSLContext dsl;

    public OrderQueryRepository(DSLContext dsl) {
        this.dsl = dsl;
    }

    public List<OrderSummaryProjection> findByUserPublicId(UUID userPublicId) {
        var pedido = table(name("pedidos")).as("p");
        var cliente = table(name("clientes")).as("c");
        var usuario = table(name("usuarios")).as("u");
        var estado = table(name("estados_pedido")).as("ep");
        var detalle = table(name("detalle_pedido")).as("dp");

        return dsl.select(
                        field(name("p", "public_id"), UUID.class).as("publicId"),
                        field(name("ep", "codigo"), String.class).as("estadoCodigo"),
                        field(name("ep", "nombre"), String.class).as("estadoNombre"),
                        field(name("p", "total"), BigDecimal.class).as("total"),
                        field(name("p", "fecha_pedido"), LocalDateTime.class).as("fechaPedido"),
                        countDistinct(field(name("dp", "id_detalle_pedido"))).as("cantidadProductos"))
                .from(pedido)
                .join(cliente).on(field(name("p", "id_cliente")).eq(field(name("c", "id_cliente"))))
                .join(usuario).on(field(name("c", "id_usuario")).eq(field(name("u", "id_usuario"))))
                .join(estado).on(field(name("p", "id_estado_pedido")).eq(field(name("ep", "id_estado_pedido"))))
                .leftJoin(detalle).on(field(name("dp", "id_pedido")).eq(field(name("p", "id_pedido"))))
                .where(field(name("u", "public_id"), UUID.class).eq(userPublicId))
                .groupBy(
                        field(name("p", "public_id")), field(name("ep", "codigo")), field(name("ep", "nombre")),
                        field(name("p", "total")), field(name("p", "fecha_pedido")))
                .orderBy(field(name("p", "fecha_pedido"), LocalDateTime.class).desc())
                .fetchInto(OrderSummaryProjection.class);
    }

    public Optional<OrderDetailProjection> findDetailByUserPublicId(UUID userPublicId, UUID orderPublicId) {
        var pedido = table(name("pedidos")).as("p");
        var cliente = table(name("clientes")).as("c");
        var usuario = table(name("usuarios")).as("u");
        var estado = table(name("estados_pedido")).as("ep");
        var base = dsl.select(
                        field(name("p", "id_pedido"), Integer.class).as("idPedido"),
                        field(name("p", "public_id"), UUID.class).as("publicId"),
                        field(name("ep", "codigo"), String.class).as("estadoCodigo"),
                        field(name("ep", "nombre"), String.class).as("estadoNombre"),
                        field(name("p", "total"), BigDecimal.class).as("total"),
                        field(name("p", "fecha_pedido"), LocalDateTime.class).as("fechaPedido"),
                        field(name("p", "direccion_entrega"), String.class).as("direccionEntrega"))
                .from(pedido)
                .join(cliente).on(field(name("p", "id_cliente")).eq(field(name("c", "id_cliente"))))
                .join(usuario).on(field(name("c", "id_usuario")).eq(field(name("u", "id_usuario"))))
                .join(estado).on(field(name("p", "id_estado_pedido")).eq(field(name("ep", "id_estado_pedido"))))
                .where(field(name("u", "public_id"), UUID.class).eq(userPublicId)
                        .and(field(name("p", "public_id"), UUID.class).eq(orderPublicId)))
                .fetchOneInto(OrderBase.class);
        if (base == null) return Optional.empty();

        List<OrderItemResult> productos = dsl.select(
                        field(name("pr", "public_id"), UUID.class).as("productoPublicId"),
                        field(name("pr", "nombre"), String.class).as("nombre"),
                        field(name("dp", "cantidad"), Integer.class).as("cantidad"),
                        field(name("dp", "precio_unitario"), BigDecimal.class).as("precioUnitario"),
                        field(name("dp", "subtotal"), BigDecimal.class).as("subtotal"))
                .from(table(name("detalle_pedido")).as("dp"))
                .join(table(name("productos")).as("pr")).on(field(name("dp", "id_producto")).eq(field(name("pr", "id_producto"))))
                .where(field(name("dp", "id_pedido"), Integer.class).eq(base.idPedido()))
                .orderBy(field(name("dp", "id_detalle_pedido"), Integer.class).asc())
                .fetchInto(OrderItemResult.class);
        List<OrderTrackingResult> seguimiento = dsl.select(
                        field(name("codigo_estado"), String.class).as("estadoCodigo"),
                        field(name("titulo"), String.class).as("titulo"),
                        field(name("descripcion"), String.class).as("descripcion"),
                        field(name("ubicacion"), String.class).as("ubicacion"),
                        field(name("fecha_evento"), LocalDateTime.class).as("fechaEvento"))
                .from(table(name("seguimiento_pedidos")))
                .where(field(name("id_pedido"), Integer.class).eq(base.idPedido()))
                .orderBy(field(name("fecha_evento"), LocalDateTime.class).asc())
                .fetchInto(OrderTrackingResult.class);

        return Optional.of(new OrderDetailProjection(base.publicId(), base.estadoCodigo(), base.estadoNombre(),
                base.total(), base.fechaPedido(), base.direccionEntrega(), productos, seguimiento));
    }

    private record OrderBase(
            Integer idPedido, UUID publicId, String estadoCodigo, String estadoNombre,
            BigDecimal total, LocalDateTime fechaPedido, String direccionEntrega
    ) { }
}
