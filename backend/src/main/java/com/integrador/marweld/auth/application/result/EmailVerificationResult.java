package com.integrador.marweld.auth.application.result;

import java.util.UUID;

public record EmailVerificationResult(
        UUID userPublicId,
        String correo,
        String estado
) {
}
