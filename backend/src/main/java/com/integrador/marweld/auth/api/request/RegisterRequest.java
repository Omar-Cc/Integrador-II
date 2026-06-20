package com.integrador.marweld.auth.api.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 160, message = "El nombre no puede exceder los 160 caracteres")
    String nombre,

    @NotBlank(message = "El correo es obligatorio")
    @Email(message = "El formato de correo es inválido")
    @Size(max = 320, message = "El correo no puede exceder los 320 caracteres")
    String correo,

    @NotBlank(message = "La contraseña es obligatoria")
    @Pattern(
        regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).{8,255}$",
        message = "La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial"
    )
    String contrasena,

    @Size(max = 30, message = "El teléfono no puede exceder los 30 caracteres")
    String telefono,

    @NotBlank(message = "El documento es obligatorio")
    @Size(max = 30, message = "El documento no puede exceder los 30 caracteres")
    String documento,

    @NotBlank(message = "La dirección es obligatoria")
    String direccion
) {}
