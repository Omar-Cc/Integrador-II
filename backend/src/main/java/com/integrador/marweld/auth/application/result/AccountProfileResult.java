package com.integrador.marweld.auth.application.result;

import java.time.LocalDateTime;
import java.util.UUID;

public record AccountProfileResult(
        UUID userPublicId,
        String nombre,
        String correo,
        String telefono,
        String direccion,
        String documento,
        LocalDateTime fechaRegistro
) { }
