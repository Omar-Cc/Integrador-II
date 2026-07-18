package com.integrador.marweld.orders.api.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;

import java.util.List;

public record CheckoutRequest(
        @NotEmpty List<@Valid CheckoutItemRequest> items,
        @NotBlank @Pattern(regexp = "(?i)DOMICILIO|TIENDA") String modalidadEntrega,
        String nombreRecibe,
        String telefono,
        String direccion,
        String distrito,
        String referencia,
        @NotBlank @Email String correo
) { }
