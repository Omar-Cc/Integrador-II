package com.integrador.marweld.auth.api.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @NotBlank @Email String correo,
        @NotBlank String contrasena) {}
