package com.integrador.marweld.cart.application.port;

import java.util.Optional;
import java.util.UUID;

/**
 * Puerto para leer productos desde el modulo propietario del catalogo.
 */
public interface CartProductReader {

    Optional<CartProductSnapshot> findActiveByPublicId(UUID publicId);

    Optional<CartProductSnapshot> findActiveById(Integer idProducto);
}