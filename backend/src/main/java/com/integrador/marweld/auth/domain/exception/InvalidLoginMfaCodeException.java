package com.integrador.marweld.auth.domain.exception;

import com.integrador.marweld.core.exception.UnauthorizedException;

public class InvalidLoginMfaCodeException extends UnauthorizedException {
    public InvalidLoginMfaCodeException() { super("El codigo MFA es invalido.", "INVALID_MFA_CODE"); }
}
