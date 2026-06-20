package com.integrador.marweld.auth.application.result;

import java.util.UUID;

public record RegisterResult(
    UUID userPublicId,
    UUID clientPublicId,
    String nombre,
    String correo,
    String estado
) {}
