package com.integrador.marweld.auth.domain.exception;

import com.integrador.marweld.core.exception.UnauthorizedException;

public class InvalidMfaChallengeException extends UnauthorizedException {
    public InvalidMfaChallengeException() { super("El desafio MFA no es valido o ya expiro.", "INVALID_MFA_CHALLENGE"); }
}
