package com.integrador.marweld.auth.domain.exception;

import com.integrador.marweld.core.exception.UnauthorizedException;

public class MfaCodeIncorrectException extends UnauthorizedException {
    public MfaCodeIncorrectException() {
        super("Código incorrecto", "INVALID_MFA_CODE");
    }
}
