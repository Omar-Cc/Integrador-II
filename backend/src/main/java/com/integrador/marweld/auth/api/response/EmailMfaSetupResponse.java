package com.integrador.marweld.auth.api.response;

import java.time.LocalDateTime;

public record EmailMfaSetupResponse(
        String metodo,
        String estado,
        LocalDateTime fechaExpiracion
) {
}
