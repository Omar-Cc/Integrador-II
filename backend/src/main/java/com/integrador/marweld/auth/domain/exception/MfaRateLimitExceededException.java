package com.integrador.marweld.auth.domain.exception;

import com.integrador.marweld.core.exception.ValidationException;

public class MfaRateLimitExceededException extends ValidationException {
    public MfaRateLimitExceededException(String message) {
        super(message, "MFA_RATE_LIMIT_EXCEEDED");
    }
}
