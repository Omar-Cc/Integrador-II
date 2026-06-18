package com.integrador.marweld.auth.domain.exception;

import com.integrador.marweld.core.exception.ValidationException;

public class InvalidVerificationCodeException extends ValidationException {
    public InvalidVerificationCodeException() {
        super("El codigo de verificacion es invalido.", "INVALID_VERIFICATION_CODE");
    }
}
