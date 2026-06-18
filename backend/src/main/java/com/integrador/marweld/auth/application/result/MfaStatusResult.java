package com.integrador.marweld.auth.application.result;

public record MfaStatusResult(
        boolean totpEnabled,
        boolean emailOtpEnabled
) {
}
