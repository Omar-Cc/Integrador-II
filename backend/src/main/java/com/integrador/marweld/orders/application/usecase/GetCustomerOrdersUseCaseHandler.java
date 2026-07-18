package com.integrador.marweld.orders.application.usecase;

import com.integrador.marweld.orders.application.result.OrderDetailResult;
import com.integrador.marweld.orders.application.result.OrderSummaryResult;
import com.integrador.marweld.orders.domain.exception.OrderNotFoundException;
import com.integrador.marweld.orders.infrastructure.persistence.projection.OrderDetailProjection;
import com.integrador.marweld.orders.infrastructure.persistence.projection.OrderSummaryProjection;
import com.integrador.marweld.orders.infrastructure.persistence.query.OrderQueryRepository;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

@Component
public class GetCustomerOrdersUseCaseHandler implements GetCustomerOrdersUseCase {
    private final OrderQueryRepository orderQueryRepository;

    public GetCustomerOrdersUseCaseHandler(OrderQueryRepository orderQueryRepository) {
        this.orderQueryRepository = orderQueryRepository;
    }

    @Override
    public List<OrderSummaryResult> getOrders(String userPublicId) {
        return orderQueryRepository.findByUserPublicId(UUID.fromString(userPublicId)).stream()
                .map(this::toSummaryResult)
                .toList();
    }

    @Override
    public OrderDetailResult getOrder(String userPublicId, UUID orderPublicId) {
        OrderDetailProjection order = orderQueryRepository
                .findDetailByUserPublicId(UUID.fromString(userPublicId), orderPublicId)
                .orElseThrow(() -> new OrderNotFoundException(orderPublicId));
        return new OrderDetailResult(order.publicId(), order.estadoCodigo(), order.estadoNombre(), order.total(),
                order.fechaPedido(), order.direccionEntrega(), order.productos(), order.seguimiento());
    }

    private OrderSummaryResult toSummaryResult(OrderSummaryProjection order) {
        return new OrderSummaryResult(order.publicId(), order.estadoCodigo(), order.estadoNombre(), order.total(),
                order.fechaPedido(), order.cantidadProductos() == null ? 0 : order.cantidadProductos());
    }
}
