package com.integrador.marweld.auth.api.response;

public record MfaMethodResponse(
        String metodo,
        String estado
) {
}
