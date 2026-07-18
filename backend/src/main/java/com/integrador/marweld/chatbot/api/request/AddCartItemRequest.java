package com.integrador.marweld.chatbot.api.request;

import java.util.UUID;

/**
 * Entrada HTTP para sincronizar un producto con el carrito del chatbot.
 */
public record AddCartItemRequest(
        UUID productPublicId,
        int cantidad
) {}