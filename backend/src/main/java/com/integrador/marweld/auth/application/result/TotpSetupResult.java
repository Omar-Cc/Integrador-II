package com.integrador.marweld.auth.application.result;

public record TotpSetupResult(
        String otpauthUri,
        String qrCodeDataUrl,
        String estado
) {
}
