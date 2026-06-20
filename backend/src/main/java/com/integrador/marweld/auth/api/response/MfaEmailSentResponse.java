package com.integrador.marweld.auth.api.response;

import java.time.LocalDateTime;

public record MfaEmailSentResponse(LocalDateTime expiresAt) {}
