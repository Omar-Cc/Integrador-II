package com.integrador.marweld.cart.application.service;

import com.integrador.marweld.cart.application.port.CartProductReader;
import com.integrador.marweld.cart.application.port.CartProductSnapshot;
import com.integrador.marweld.cart.domain.model.Carrito;
import com.integrador.marweld.cart.domain.model.DetalleCarrito;
import com.integrador.marweld.cart.domain.model.EstadoCarrito;
import com.integrador.marweld.cart.infrastructure.persistence.repository.CarritoRepository;
import com.integrador.marweld.cart.infrastructure.persistence.repository.DetalleCarritoRepository;
import com.integrador.marweld.cart.infrastructure.persistence.repository.EstadoCarritoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CartServiceImplTest {

    @Mock
    private CarritoRepository carritoRepository;

    @Mock
    private DetalleCarritoRepository detalleCarritoRepository;

    @Mock
    private EstadoCarritoRepository estadoCarritoRepository;

    @Mock
    private CartProductReader cartProductReader;

    private CartServiceImpl service;

    @BeforeEach
    void setUp() {
        service = new CartServiceImpl(carritoRepository, detalleCarritoRepository, estadoCarritoRepository, cartProductReader);
    }

    @Test
    void getOrCreateOpenCartReturnsExistingCustomerCart() {
        Carrito cart = Carrito.builder().idCarrito(8).build();
        when(carritoRepository.findFirstByIdClienteAndEstadoCarritoCodigoOrderByFechaCreacionDesc(4, "ABIERTO"))
                .thenReturn(Optional.of(cart));

        Integer id = service.getOrCreateOpenCart(4, null);

        assertThat(id).isEqualTo(8);
    }

    @Test
    void getOrCreateOpenCartCreatesVisitorCartWhenMissing() {
        EstadoCarrito status = new EstadoCarrito();
        status.setCodigo("ABIERTO");
        when(carritoRepository.findFirstByTokenVisitanteAndEstadoCarritoCodigoOrderByFechaCreacionDesc("visit-1", "ABIERTO"))
                .thenReturn(Optional.empty());
        when(estadoCarritoRepository.findByCodigo("ABIERTO")).thenReturn(Optional.of(status));
        when(carritoRepository.save(any(Carrito.class))).thenAnswer(invocation -> {
            Carrito cart = invocation.getArgument(0);
            cart.setIdCarrito(11);
            return cart;
        });

        Integer id = service.getOrCreateOpenCart(null, "visit-1");

        assertThat(id).isEqualTo(11);
        verify(carritoRepository).save(any(Carrito.class));
    }

    @Test
    void addProductUpdatesQuantityAndRecalculatesTotal() {
        UUID productPublicId = UUID.randomUUID();
        Carrito cart = Carrito.builder().idCarrito(5).total(BigDecimal.ZERO).build();
        DetalleCarrito detail = DetalleCarrito.builder()
                .carrito(cart)
                .idProducto(2)
                .cantidad(1)
                .precioUnitario(new BigDecimal("12.00"))
                .subtotal(new BigDecimal("12.00"))
                .build();
        when(carritoRepository.findById(5)).thenReturn(Optional.of(cart));
        when(cartProductReader.findActiveByPublicId(productPublicId))
                .thenReturn(Optional.of(new CartProductSnapshot(2, productPublicId, "Electrodo", new BigDecimal("12.00"))));
        when(detalleCarritoRepository.findByCarritoIdCarritoAndIdProducto(5, 2)).thenReturn(Optional.of(detail));
        when(detalleCarritoRepository.findByCarritoIdCarrito(5)).thenReturn(List.of(detail));

        service.addProduct(5, productPublicId, 3);

        assertThat(detail.getCantidad()).isEqualTo(4);
        assertThat(detail.getSubtotal()).isEqualByComparingTo("48.00");
        assertThat(cart.getTotal()).isEqualByComparingTo("48.00");
        verify(detalleCarritoRepository).save(detail);
        verify(carritoRepository).save(cart);
    }
}