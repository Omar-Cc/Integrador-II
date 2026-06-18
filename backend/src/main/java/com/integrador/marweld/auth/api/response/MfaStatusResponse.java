package com.integrador.marweld.auth.api.response;

public record MfaStatusResponse(
        boolean totpEnabled,
        boolean emailOtpEnabled
) {
}
