package com.integrador.marweld.core.exception;

public abstract class AppException extends RuntimeException {
    private final String errorCode;

    protected AppException(String message, String errorCode) {
        super(message);
        this.errorCode = errorCode;
    }

    protected AppException(String message, String errorCode, Throwable cause) {
        super(message, cause);
        this.errorCode = errorCode;
    }

    public String getErrorCode() {
        return errorCode;
    }
}
