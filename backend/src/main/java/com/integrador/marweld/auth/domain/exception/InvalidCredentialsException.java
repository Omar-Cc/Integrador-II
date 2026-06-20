package com.integrador.marweld.auth.domain.exception;

import com.integrador.marweld.core.exception.UnauthorizedException;

public class InvalidCredentialsException extends UnauthorizedException {
    public InvalidCredentialsException() { super("Correo o contrasena incorrectos.", "INVALID_CREDENTIALS"); }
}
