package com.integrador.marweld.auth.domain.exception;

import com.integrador.marweld.core.exception.UnauthorizedException;

public class TooManyMfaAttemptsException extends UnauthorizedException {
    public TooManyMfaAttemptsException() {
        super("Demasiados intentos, intenta más tarde", "TOO_MANY_MFA_ATTEMPTS");
    }
}
