package com.integrador.marweld.auth.application.result;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record MfaChallengeResult(UUID challengePublicId, LocalDateTime expiresAt,
                                 List<String> availableMethods, String defaultMethod) {}
