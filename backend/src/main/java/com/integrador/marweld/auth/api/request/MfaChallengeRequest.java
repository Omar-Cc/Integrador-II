package com.integrador.marweld.auth.api.request;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record MfaChallengeRequest(@NotNull UUID challengePublicId) {}
