package com.integrador.marweld.cart.application.service;

import com.integrador.marweld.cart.application.result.CartSummaryItem;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Fachada de aplicacion del modulo de carrito.
 */
public interface CartService {

    Integer getOrCreateOpenCart(Integer idCliente, String tokenVisitante);

    Optional<UUID> getCartPublicId(Integer idCarrito);

    List<CartSummaryItem> getSummary(Integer idCarrito);

    void addProduct(Integer idCarrito, UUID productPublicId, int cantidad);

    void removeProduct(Integer idCarrito, UUID productPublicId);
}