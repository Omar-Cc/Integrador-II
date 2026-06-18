package com.integrador.marweld.chatbot.domain.model;

/**
 * Enum que representa el rol de un producto mencionado en un mensaje de chatbot.
 */
public enum RolProductoMensaje {
    /**
     * El producto fue mencionado de forma informativa.
     */
    MENCIONADO,

    /**
     * El producto fue sugerido o recomendado de forma activa por el bot.
     */
    RECOMENDADO,

    /**
     * El producto fue seleccionado o clickeado por el usuario en esta interacción.
     */
    SELECCIONADO
}
