package com.integrador.marweld.core.exception;

public abstract class DomainException extends AppException {
    protected DomainException(String message, String errorCode) {
        super(message, errorCode);
    }
}
