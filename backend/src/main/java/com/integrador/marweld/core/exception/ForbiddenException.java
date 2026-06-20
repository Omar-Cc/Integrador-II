package com.integrador.marweld.core.exception;

public abstract class ForbiddenException extends AppException {
    protected ForbiddenException(String message, String errorCode) { super(message, errorCode); }
}
