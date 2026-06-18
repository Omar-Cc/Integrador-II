package com.integrador.marweld.core.exception;

public abstract class ConflictException extends AppException {
    protected ConflictException(String message, String errorCode) {
        super(message, errorCode);
    }
}
