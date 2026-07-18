package com.integrador.marweld.orders.api.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record CheckoutItemRequest(
        @NotNull UUID productoPublicId,
        @Min(1) int cantidad
) { }
