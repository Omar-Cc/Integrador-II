package com.integrador.marweld.auth.api.response;

import java.util.UUID;

public record AuthenticatedUserResponse(UUID userPublicId, UUID clientPublicId, String nombre,
                                        String correo, String rol) {}
