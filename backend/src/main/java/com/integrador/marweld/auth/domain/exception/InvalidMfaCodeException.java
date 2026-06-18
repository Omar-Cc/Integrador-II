package com.integrador.marweld.auth.domain.exception;

import com.integrador.marweld.core.exception.ValidationException;

public class InvalidMfaCodeException extends ValidationException {
    public InvalidMfaCodeException() {
        super("El codigo 2FA es invalido.", "INVALID_MFA_CODE");
    }
}
