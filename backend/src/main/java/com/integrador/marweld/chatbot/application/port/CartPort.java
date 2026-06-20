package com.integrador.marweld.chatbot.application.port;

/**
 * Puerto de interfaz para comunicarse con el módulo de Carrito de compras.
 * Permite desacoplar el chatbot del módulo de e-commerce.
 */
public interface CartPort {

    /**
     * Obtiene un resumen en texto del contenido del carrito actual para inyectar en el prompt.
     *
     * @param idCarrito ID interno del carrito.
     * @return Cadena formateada del resumen del carrito (ej. 'Carrito vacío' o lista de productos).
     */
    String getCartSummary(Integer idCarrito);
}
