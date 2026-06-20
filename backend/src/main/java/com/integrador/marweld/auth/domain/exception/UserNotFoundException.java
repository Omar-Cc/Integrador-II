package com.integrador.marweld.auth.domain.exception;

import com.integrador.marweld.core.exception.NotFoundException;

public class UserNotFoundException extends NotFoundException {
    public UserNotFoundException() {
        super("No existe una cuenta registrada con ese correo.", "USER_NOT_FOUND");
    }
}
