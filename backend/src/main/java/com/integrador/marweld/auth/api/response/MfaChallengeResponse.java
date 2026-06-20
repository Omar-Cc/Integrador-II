package com.integrador.marweld.auth.api.response;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record MfaChallengeResponse(UUID challengePublicId, LocalDateTime expiresAt,
                                   List<String> availableMethods, String defaultMethod) {}
