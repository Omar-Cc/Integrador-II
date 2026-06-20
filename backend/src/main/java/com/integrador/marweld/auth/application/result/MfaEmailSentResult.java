package com.integrador.marweld.auth.application.result;

import java.time.LocalDateTime;

public record MfaEmailSentResult(LocalDateTime expiresAt) {}
