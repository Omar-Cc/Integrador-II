package com.integrador.marweld.auth.api.response;

import java.time.LocalDateTime;
import java.util.UUID;

public record AccountProfileResponse(
        UUID userPublicId,
        String nombre,
        String correo,
        String telefono,
        String direccion,
        String documento,
        LocalDateTime fechaRegistro
) { }
