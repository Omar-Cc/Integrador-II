package com.integrador.marweld.auth.domain.exception;

import com.integrador.marweld.core.exception.ConflictException;

public class MfaMethodAlreadyEnabledException extends ConflictException {
    public MfaMethodAlreadyEnabledException() {
        super("El metodo 2FA ya se encuentra activo.", "MFA_METHOD_ALREADY_ENABLED");
    }
}
