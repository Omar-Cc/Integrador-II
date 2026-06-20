package com.integrador.marweld.core.exception;

public abstract class UnauthorizedException extends AppException {
    protected UnauthorizedException(String message, String errorCode) { super(message, errorCode); }
}
