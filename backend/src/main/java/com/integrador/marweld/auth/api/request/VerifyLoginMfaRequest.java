package com.integrador.marweld.auth.api.request;

import com.integrador.marweld.auth.domain.model.MetodoMfa;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import java.util.UUID;

public record VerifyLoginMfaRequest(
        @NotNull UUID challengePublicId,
        @NotNull MetodoMfa method,
        @NotBlank @Pattern(regexp = "^\\d{6}$") String codigo) {}
