package com.integrador.marweld.auth.api.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ResendVerificationCodeRequest(
        @NotBlank(message = "El correo es obligatorio")
        @Email(message = "El formato de correo es invalido")
        @Size(max = 320, message = "El correo no puede exceder los 320 caracteres")
        String correo
) {
}
