package com.integrador.marweld.auth.domain.exception;

import com.integrador.marweld.core.exception.ConflictException;

public class EmailAlreadyExistsException extends ConflictException {
    public EmailAlreadyExistsException() {
        super("El correo electrónico ya se encuentra registrado.", "EMAIL_ALREADY_EXISTS");
    }
}
