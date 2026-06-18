package com.integrador.marweld.auth.domain.exception;

import com.integrador.marweld.core.exception.ValidationException;

public class VerificationCodeExpiredException extends ValidationException {
    public VerificationCodeExpiredException() {
        super("El codigo de verificacion ha expirado. Solicita uno nuevo.", "VERIFICATION_CODE_EXPIRED");
    }
}
