package com.integrador.marweld.auth.api.response;

public record TotpSetupResponse(
        String otpauthUri,
        String qrCodeDataUrl,
        String estado
) {
}
