package com.integrador.marweld.catalog.infrastructure.adapter;

import com.integrador.marweld.cart.application.port.CartProductReader;
import com.integrador.marweld.cart.application.port.CartProductSnapshot;
import com.integrador.marweld.catalog.domain.model.Producto;
import com.integrador.marweld.catalog.infrastructure.persistence.repository.ProductoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

/**
 * Adapter de catalogo para entregar datos minimos de producto al carrito.
 */
@Component
@RequiredArgsConstructor
public class CatalogCartProductReaderAdapter implements CartProductReader {

    private final ProductoRepository productoRepository;

    @Override
    @Transactional(readOnly = true)
    public Optional<CartProductSnapshot> findActiveByPublicId(UUID publicId) {
        return productoRepository.findByPublicId(publicId)
                .filter(this::isActive)
                .map(this::toSnapshot);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<CartProductSnapshot> findActiveById(Integer idProducto) {
        if (idProducto == null) {
            return Optional.empty();
        }
        return productoRepository.findById(idProducto)
                .filter(this::isActive)
                .map(this::toSnapshot);
    }

    private boolean isActive(Producto product) {
        return "ACTIVO".equalsIgnoreCase(product.getEstado());
    }

    private CartProductSnapshot toSnapshot(Producto product) {
        return new CartProductSnapshot(product.getIdProducto(), product.getPublicId(), product.getNombre(), product.getPrecio());
    }
}