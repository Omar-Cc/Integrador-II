package com.integrador.marweld.orders.domain.exception;

import com.integrador.marweld.core.exception.NotFoundException;

import java.util.UUID;

public class OrderNotFoundException extends NotFoundException {
    public OrderNotFoundException(UUID publicId) {
        super("No se encontró el pedido solicitado.", "ORDER_NOT_FOUND");
    }
}
