package com.integrador.marweld.core.exception;

public abstract class ValidationException extends AppException {
    protected ValidationException(String message, String errorCode) {
        super(message, errorCode);
    }
}
