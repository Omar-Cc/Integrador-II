package com.integrador.marweld.auth.domain.exception;

import com.integrador.marweld.core.exception.UnauthorizedException;

public class InvalidRefreshTokenException extends UnauthorizedException {
    public InvalidRefreshTokenException() { super("La sesion no es valida o ya expiro.", "INVALID_REFRESH_TOKEN"); }
}
