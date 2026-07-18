package com.integrador.marweld.orders.application.usecase;

import com.integrador.marweld.orders.application.result.OrderDetailResult;
import com.integrador.marweld.orders.infrastructure.persistence.projection.OrderDetailProjection;
import com.integrador.marweld.orders.infrastructure.persistence.projection.OrderSummaryProjection;
import com.integrador.marweld.orders.infrastructure.persistence.query.OrderQueryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GetCustomerOrdersUseCaseHandlerTest {
    @Mock
    private OrderQueryRepository orderQueryRepository;

    private GetCustomerOrdersUseCaseHandler useCase;
    private final UUID userPublicId = UUID.randomUUID();
    private final UUID orderPublicId = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        useCase = new GetCustomerOrdersUseCaseHandler(orderQueryRepository);
    }

    @Test
    void getOrdersMapsCustomerHistory() {
        when(orderQueryRepository.findByUserPublicId(userPublicId)).thenReturn(List.of(
                new OrderSummaryProjection(orderPublicId, "ENVIADO", "Enviado", new BigDecimal("1850.00"),
                        LocalDateTime.of(2026, 7, 18, 10, 0), 2)));

        var orders = useCase.getOrders(userPublicId.toString());

        assertThat(orders).singleElement().satisfies(order -> {
            assertThat(order.publicId()).isEqualTo(orderPublicId);
            assertThat(order.estadoCodigo()).isEqualTo("ENVIADO");
            assertThat(order.cantidadProductos()).isEqualTo(2);
        });
    }

    @Test
    void getOrderReturnsOnlyTheOwnedOrderDetail() {
        OrderDetailProjection projection = new OrderDetailProjection(orderPublicId, "ENTREGADO", "Entregado",
                new BigDecimal("2350.00"), LocalDateTime.of(2026, 7, 18, 11, 0), "Av. Industrial 100",
                List.of(), List.of());
        when(orderQueryRepository.findDetailByUserPublicId(userPublicId, orderPublicId)).thenReturn(Optional.of(projection));

        OrderDetailResult order = useCase.getOrder(userPublicId.toString(), orderPublicId);

        assertThat(order.publicId()).isEqualTo(orderPublicId);
        assertThat(order.direccionEntrega()).isEqualTo("Av. Industrial 100");
    }

    @Test
    void getOrderFailsWhenTheOrderDoesNotBelongToTheCustomer() {
        when(orderQueryRepository.findDetailByUserPublicId(userPublicId, orderPublicId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> useCase.getOrder(userPublicId.toString(), orderPublicId))
                .hasMessage("No se encontró el pedido solicitado.");
    }
}
