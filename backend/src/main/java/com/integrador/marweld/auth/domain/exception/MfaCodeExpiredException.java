package com.integrador.marweld.auth.domain.exception;

import com.integrador.marweld.core.exception.ValidationException;

public class MfaCodeExpiredException extends ValidationException {
    public MfaCodeExpiredException() {
        super("El codigo 2FA ha expirado. Solicita uno nuevo.", "MFA_CODE_EXPIRED");
    }
}
