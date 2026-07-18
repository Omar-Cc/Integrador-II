package com.integrador.marweld.cart.infrastructure.adapter;

import com.integrador.marweld.cart.application.service.CartService;
import com.integrador.marweld.chatbot.application.port.CartPort;
import com.integrador.marweld.chatbot.application.port.CartSummaryItem;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Adapter del modulo cart para satisfacer el port consumido por chatbot.
 */
@Component
@RequiredArgsConstructor
public class CartChatbotAdapter implements CartPort {

    private final CartService cartService;

    @Override
    public List<CartSummaryItem> getCartItems(Integer idCarrito) {
        return cartService.getSummary(idCarrito).stream()
                .map(item -> new CartSummaryItem(
                        item.productPublicId(), item.nombre(), item.cantidad(), item.precioUnitario(), item.subtotal()))
                .toList();
    }

    @Override
    public void addProductToCart(Integer idCarrito, UUID productPublicId, int cantidad) {
        cartService.addProduct(idCarrito, productPublicId, cantidad);
    }

    @Override
    public void removeProductFromCart(Integer idCarrito, UUID productPublicId) {
        cartService.removeProduct(idCarrito, productPublicId);
    }

    @Override
    public Integer getOrCreateCart(Integer idCliente, String tokenVisitante) {
        return cartService.getOrCreateOpenCart(idCliente, tokenVisitante);
    }

    @Override
    public Optional<UUID> getCartPublicId(Integer idCarrito) {
        return cartService.getCartPublicId(idCarrito);
    }
}
