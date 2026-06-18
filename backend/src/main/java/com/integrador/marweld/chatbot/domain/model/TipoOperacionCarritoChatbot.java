package com.integrador.marweld.chatbot.domain.model;

/**
 * Enum que representa los tipos de operaciones realizadas sobre el carrito desde el chatbot.
 */
public enum TipoOperacionCarritoChatbot {
    /**
     * Agregar un nuevo ítem o incrementar su cantidad inicial.
     */
    AGREGAR,

    /**
     * Remover por completo un ítem del carrito.
     */
    QUITAR,

    /**
     * Modificar directamente la cantidad de un ítem existente.
     */
    MODIFICAR_CANTIDAD
}
