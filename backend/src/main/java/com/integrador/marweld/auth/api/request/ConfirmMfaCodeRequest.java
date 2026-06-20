package com.integrador.marweld.auth.api.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record ConfirmMfaCodeRequest(
        @NotBlank(message = "El codigo 2FA es obligatorio")
        @Pattern(regexp = "^\\d{6}$", message = "El codigo 2FA debe tener 6 digitos")
        String codigo
) {
}
