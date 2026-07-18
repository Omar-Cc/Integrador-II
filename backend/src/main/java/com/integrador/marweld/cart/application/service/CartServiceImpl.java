package com.integrador.marweld.cart.application.service;

import com.integrador.marweld.cart.application.port.CartProductReader;
import com.integrador.marweld.cart.application.port.CartProductSnapshot;
import com.integrador.marweld.cart.application.result.CartSummaryItem;
import com.integrador.marweld.cart.domain.model.Carrito;
import com.integrador.marweld.cart.domain.model.DetalleCarrito;
import com.integrador.marweld.cart.domain.model.EstadoCarrito;
import com.integrador.marweld.cart.infrastructure.persistence.repository.CarritoRepository;
import com.integrador.marweld.cart.infrastructure.persistence.repository.DetalleCarritoRepository;
import com.integrador.marweld.cart.infrastructure.persistence.repository.EstadoCarritoRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Implementacion transaccional de las operaciones de carrito.
 */
@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {

    private static final Logger log = LoggerFactory.getLogger(CartServiceImpl.class);
    private static final String OPEN_STATUS = "ABIERTO";

    private final CarritoRepository carritoRepository;
    private final DetalleCarritoRepository detalleCarritoRepository;
    private final EstadoCarritoRepository estadoCarritoRepository;
    private final CartProductReader cartProductReader;

    @Override
    @Transactional
    public Integer getOrCreateOpenCart(Integer idCliente, String tokenVisitante) {
        String finalToken = resolveVisitorToken(idCliente, tokenVisitante);
        Optional<Carrito> existing = idCliente != null
                ? carritoRepository.findFirstByIdClienteAndEstadoCarritoCodigoOrderByFechaCreacionDesc(idCliente, OPEN_STATUS)
                : carritoRepository.findFirstByTokenVisitanteAndEstadoCarritoCodigoOrderByFechaCreacionDesc(finalToken, OPEN_STATUS);

        if (existing.isPresent()) {
            return existing.get().getIdCarrito();
        }

        EstadoCarrito openStatus = estadoCarritoRepository.findByCodigo(OPEN_STATUS)
                .orElseThrow(() -> new IllegalStateException("Estado de carrito ABIERTO no configurado."));
        Carrito saved = carritoRepository.save(Carrito.builder()
                .idCliente(idCliente)
                .tokenVisitante(idCliente == null ? finalToken : null)
                .estadoCarrito(openStatus)
                .total(BigDecimal.ZERO)
                .build());

        log.info("cart_created idCarrito={} idCliente={} hasVisitorToken={}", saved.getIdCarrito(), idCliente, finalToken != null);
        return saved.getIdCarrito();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<UUID> getCartPublicId(Integer idCarrito) {
        if (idCarrito == null) {
            return Optional.empty();
        }
        return carritoRepository.findById(idCarrito).map(Carrito::getPublicId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CartSummaryItem> getSummary(Integer idCarrito) {
        if (idCarrito == null) {
            return List.of();
        }
        return detalleCarritoRepository.findByCarritoIdCarrito(idCarrito).stream()
                .map(this::toSummaryItem)
                .toList();
    }

    @Override
    @Transactional
    public void addProduct(Integer idCarrito, UUID productPublicId, int cantidad) {
        if (idCarrito == null || productPublicId == null || cantidad <= 0) {
            return;
        }

        Optional<Carrito> cart = carritoRepository.findById(idCarrito);
        Optional<CartProductSnapshot> product = cartProductReader.findActiveByPublicId(productPublicId);
        if (cart.isEmpty() || product.isEmpty()) {
            log.warn("cart_add_skipped idCarrito={} productPublicId={}", idCarrito, productPublicId);
            return;
        }

        CartProductSnapshot snapshot = product.get();
        DetalleCarrito detail = detalleCarritoRepository
                .findByCarritoIdCarritoAndIdProducto(idCarrito, snapshot.idProducto())
                .orElseGet(() -> DetalleCarrito.builder()
                        .carrito(cart.get())
                        .idProducto(snapshot.idProducto())
                        .cantidad(0)
                        .precioUnitario(snapshot.precio())
                        .subtotal(BigDecimal.ZERO)
                        .build());

        int newQuantity = detail.getCantidad() + cantidad;
        detail.setCantidad(newQuantity);
        detail.setPrecioUnitario(snapshot.precio());
        detail.setSubtotal(snapshot.precio().multiply(BigDecimal.valueOf(newQuantity)));
        detalleCarritoRepository.save(detail);
        recalculateTotal(cart.get());
    }

    @Override
    @Transactional
    public void removeProduct(Integer idCarrito, UUID productPublicId) {
        if (idCarrito == null || productPublicId == null) {
            return;
        }

        Optional<Carrito> cart = carritoRepository.findById(idCarrito);
        Optional<CartProductSnapshot> product = cartProductReader.findActiveByPublicId(productPublicId);
        if (cart.isEmpty() || product.isEmpty()) {
            return;
        }

        detalleCarritoRepository.deleteByCarritoIdCarritoAndIdProducto(idCarrito, product.get().idProducto());
        recalculateTotal(cart.get());
    }

    private CartSummaryItem toSummaryItem(DetalleCarrito detail) {
        CartProductSnapshot product = cartProductReader.findActiveById(detail.getIdProducto()).orElse(null);
        String productName = product != null ? product.nombre() : "Producto " + detail.getIdProducto();
        return new CartSummaryItem(
                product != null ? product.publicId() : null,
                productName,
                detail.getCantidad(),
                detail.getPrecioUnitario(),
                detail.getSubtotal());
    }

    private void recalculateTotal(Carrito carrito) {
        BigDecimal total = detalleCarritoRepository.findByCarritoIdCarrito(carrito.getIdCarrito()).stream()
                .map(DetalleCarrito::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        carrito.setTotal(total);
        carritoRepository.save(carrito);
    }

    private String resolveVisitorToken(Integer idCliente, String tokenVisitante) {
        if (idCliente != null) {
            return null;
        }
        if (tokenVisitante != null && !tokenVisitante.isBlank()) {
            return tokenVisitante;
        }
        return "visitante-" + UUID.randomUUID().toString().substring(0, 8);
    }
}
