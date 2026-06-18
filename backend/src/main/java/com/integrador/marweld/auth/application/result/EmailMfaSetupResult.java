package com.integrador.marweld.auth.application.result;

import java.time.LocalDateTime;

public record EmailMfaSetupResult(
        String metodo,
        String estado,
        LocalDateTime fechaExpiracion
) {
}
