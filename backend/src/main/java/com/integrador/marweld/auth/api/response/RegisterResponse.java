package com.integrador.marweld.auth.api.response;

import java.util.UUID;

public record RegisterResponse(
    UUID userPublicId,
    UUID clientPublicId,
    String nombre,
    String correo,
    String estado
) {}
