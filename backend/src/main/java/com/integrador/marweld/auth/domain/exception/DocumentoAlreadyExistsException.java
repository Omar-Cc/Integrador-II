package com.integrador.marweld.auth.domain.exception;

import com.integrador.marweld.core.exception.ConflictException;

public class DocumentoAlreadyExistsException extends ConflictException {
    public DocumentoAlreadyExistsException() {
        super("El documento de identidad ya se encuentra registrado.", "DOCUMENTO_ALREADY_EXISTS");
    }
}
