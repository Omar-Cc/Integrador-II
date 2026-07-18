package com.integrador.marweld.chatbot.application.port;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Puerto de interfaz para comunicarse con el modulo de carrito de compras.
 * Permite desacoplar el chatbot del modulo propietario de carrito.
 */
public interface CartPort {

    /**
     * Obtiene un resumen en texto del contenido del carrito actual para inyectar en el prompt.
     *
     * @param idCarrito ID interno del carrito
     * @return cadena formateada del resumen del carrito
     */
    default String getCartSummary(Integer idCarrito) {
        if (idCarrito == null) {
            return "Carrito no inicializado (vacio).";
        }

        List<CartSummaryItem> items = getCartItems(idCarrito);
        if (items.isEmpty()) {
            return "El carrito de compras esta vacio.";
        }

        StringBuilder summary = new StringBuilder("Contenido del carrito:\n");
        for (CartSummaryItem item : items) {
            summary.append(String.format(
                    "- %s: %d unidades x S/. %.2f (Subtotal: S/. %.2f)%n",
                    item.nombre(),
                    item.cantidad(),
                    item.precioUnitario(),
                    item.subtotal()
            ));
        }
        return summary.toString();
    }

    /**
     * Obtiene los items resumidos del carrito actual.
     *
     * @param idCarrito ID interno del carrito
     * @return items actuales del carrito
     */
    List<CartSummaryItem> getCartItems(Integer idCarrito);

    /**
     * Agrega un producto al carrito de compras utilizando el publicId y la cantidad.
     *
     * @param idCarrito ID interno del carrito
     * @param productPublicId UUID publico del producto a agregar
     * @param cantidad cantidad a agregar
     */
    void addProductToCart(Integer idCarrito, UUID productPublicId, int cantidad);

    /**
     * Elimina un producto por completo del carrito.
     *
     * @param idCarrito ID interno del carrito
     * @param productPublicId UUID publico del producto a eliminar
     */
    void removeProductFromCart(Integer idCarrito, UUID productPublicId);

    /**
     * Obtiene o crea un carrito de compras abierto para el cliente o visitante.
     *
     * @param idCliente ID interno del cliente, puede ser null
     * @param tokenVisitante token del visitante, puede ser null
     * @return ID del carrito creado o recuperado
     */
    Integer getOrCreateCart(Integer idCliente, String tokenVisitante);

    /**
     * Obtiene el UUID publico asociado a un carrito.
     *
     * @param idCarrito ID interno del carrito
     * @return UUID publico del carrito, si existe
     */
    Optional<UUID> getCartPublicId(Integer idCarrito);
}