package com.integrador.marweld.auth.api.response;

import java.util.UUID;

public record EmailVerificationResponse(
        UUID userPublicId,
        String correo,
        String estado
) {
}
