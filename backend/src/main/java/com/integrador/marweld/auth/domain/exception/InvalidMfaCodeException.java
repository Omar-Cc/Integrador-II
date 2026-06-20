package com.integrador.marweld.auth.domain.exception;

import com.integrador.marweld.core.exception.ValidationException;

public class InvalidMfaCodeException extends ValidationException {
    public InvalidMfaCodeException() {
        super("Código incorrecto", "INVALID_MFA_CODE");
    }
}
