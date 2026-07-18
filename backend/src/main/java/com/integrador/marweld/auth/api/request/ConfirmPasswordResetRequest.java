package com.integrador.marweld.auth.api.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record ConfirmPasswordResetRequest(
        @NotBlank @Email String correo,
        @NotBlank @Pattern(regexp = "^\\d{6}$") String codigo,
        @NotBlank @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).{8,255}$") String contrasena
) { }
