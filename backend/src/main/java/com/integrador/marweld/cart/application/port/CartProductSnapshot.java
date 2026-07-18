package com.integrador.marweld.cart.application.port;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Snapshot minimo de producto requerido por el carrito.
 */
public record CartProductSnapshot(
        Integer idProducto,
        UUID publicId,
        String nombre,
        BigDecimal precio
) {}