package com.integrador.marweld.auth.api.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record VerifyEmailRequest(
        @NotBlank(message = "El correo es obligatorio")
        @Email(message = "El formato de correo es invalido")
        @Size(max = 320, message = "El correo no puede exceder los 320 caracteres")
        String correo,

        @NotBlank(message = "El codigo de verificacion es obligatorio")
        @Pattern(regexp = "^\\d{6}$", message = "El codigo de verificacion debe tener 6 digitos")
        String codigo
) {
}
