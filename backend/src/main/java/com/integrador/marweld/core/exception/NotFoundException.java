package com.integrador.marweld.core.exception;

public abstract class NotFoundException extends AppException {
    protected NotFoundException(String message, String errorCode) {
        super(message, errorCode);
    }
}
