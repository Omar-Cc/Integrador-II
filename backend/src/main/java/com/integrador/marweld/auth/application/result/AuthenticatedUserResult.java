package com.integrador.marweld.auth.application.result;

import java.util.UUID;

public record AuthenticatedUserResult(UUID userPublicId, UUID clientPublicId, String nombre,
                                      String correo, String rol) {}
