package com.integrador.marweld.orders.api.controller;

import com.integrador.marweld.core.api.ApiResponse;
import com.integrador.marweld.orders.api.response.OrderDetailResponse;
import com.integrador.marweld.orders.api.response.OrderItemResponse;
import com.integrador.marweld.orders.api.response.OrderSummaryResponse;
import com.integrador.marweld.orders.api.response.OrderTrackingResponse;
import com.integrador.marweld.orders.application.result.OrderDetailResult;
import com.integrador.marweld.orders.application.result.OrderSummaryResult;
import com.integrador.marweld.orders.application.usecase.GetCustomerOrdersUseCase;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/me/orders")
public class OrderController {
    private final GetCustomerOrdersUseCase getCustomerOrdersUseCase;

    public OrderController(GetCustomerOrdersUseCase getCustomerOrdersUseCase) {
        this.getCustomerOrdersUseCase = getCustomerOrdersUseCase;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<OrderSummaryResponse>>> getOrders(@AuthenticationPrincipal Jwt jwt) {
        List<OrderSummaryResponse> data = getCustomerOrdersUseCase.getOrders(jwt.getSubject()).stream()
                .map(this::toSummaryResponse)
                .toList();
        return ResponseEntity.ok(ApiResponse.success("Historial de pedidos obtenido correctamente.", data));
    }

    @GetMapping("/{publicId}")
    public ResponseEntity<ApiResponse<OrderDetailResponse>> getOrder(
            @AuthenticationPrincipal Jwt jwt, @PathVariable UUID publicId) {
        OrderDetailResult order = getCustomerOrdersUseCase.getOrder(jwt.getSubject(), publicId);
        return ResponseEntity.ok(ApiResponse.success("Detalle del pedido obtenido correctamente.", toDetailResponse(order)));
    }

    private OrderSummaryResponse toSummaryResponse(OrderSummaryResult order) {
        return new OrderSummaryResponse(order.publicId(), order.estadoCodigo(), order.estadoNombre(), order.total(),
                order.fechaPedido(), order.cantidadProductos());
    }

    private OrderDetailResponse toDetailResponse(OrderDetailResult order) {
        List<OrderItemResponse> products = order.productos().stream()
                .map(item -> new OrderItemResponse(item.productoPublicId(), item.nombre(), item.cantidad(),
                        item.precioUnitario(), item.subtotal()))
                .toList();
        List<OrderTrackingResponse> tracking = order.seguimiento().stream()
                .map(event -> new OrderTrackingResponse(event.estadoCodigo(), event.titulo(), event.descripcion(),
                        event.ubicacion(), event.fechaEvento()))
                .toList();
        return new OrderDetailResponse(order.publicId(), order.estadoCodigo(), order.estadoNombre(), order.total(),
                order.fechaPedido(), order.direccionEntrega(), products, tracking);
    }
}
