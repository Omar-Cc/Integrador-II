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

    /**
     * Agrega un producto al carrito de compras utilizando el publicId y la cantidad.
     *
     * @param idCarrito ID interno del carrito.
     * @param productPublicId UUID público del producto a agregar.
     * @param cantidad Cantidad a agregar.
     */
    void addProductToCart(Integer idCarrito, java.util.UUID productPublicId, int cantidad);

    /**
     * Elimina un producto por completo del carrito.
     *
     * @param idCarrito ID interno del carrito.
     * @param productPublicId UUID público del producto a eliminar.
     */
    void removeProductFromCart(Integer idCarrito, java.util.UUID productPublicId);

    /**
     * Obtiene o crea un carrito de compras abierto para el cliente o visitante.
     *
     * @param idCliente ID interno del cliente (puede ser null).
     * @param tokenVisitante Token del visitante (puede ser null).
     * @return ID del carrito creado o recuperado.
     */
    Integer getOrCreateCart(Integer idCliente, String tokenVisitante);
}
