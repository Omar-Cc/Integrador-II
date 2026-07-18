package com.integrador.marweld.auth.api.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateAccountProfileRequest(
        @NotBlank @Size(max = 160) String nombre,
        @Size(max = 30) String telefono,
        @NotBlank @Size(max = 1500) String direccion
) { }
