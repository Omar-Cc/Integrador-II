package com.integrador.marweld.auth.domain.exception;

import com.integrador.marweld.core.exception.ConflictException;

public class EmailNotVerifiedException extends ConflictException {
    public EmailNotVerifiedException() {
        super("Debes verificar tu correo antes de continuar.", "EMAIL_NOT_VERIFIED");
    }
}
