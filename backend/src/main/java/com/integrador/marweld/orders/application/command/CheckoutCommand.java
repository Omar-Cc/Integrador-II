package com.integrador.marweld.orders.application.command;

import java.util.List;
import java.util.UUID;

public record CheckoutCommand(
        List<Item> items,
        String modalidadEntrega,
        String nombreRecibe,
        String telefono,
        String direccion,
        String distrito,
        String referencia,
        String correo
) {
    public record Item(UUID productoPublicId, int cantidad) { }
}
