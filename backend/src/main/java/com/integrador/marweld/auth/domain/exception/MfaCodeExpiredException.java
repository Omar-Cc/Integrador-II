package com.integrador.marweld.auth.domain.exception;

import com.integrador.marweld.core.exception.ValidationException;

public class MfaCodeExpiredException extends ValidationException {
    public MfaCodeExpiredException() {
        super("Código expirado", "MFA_CODE_EXPIRED");
    }
}
