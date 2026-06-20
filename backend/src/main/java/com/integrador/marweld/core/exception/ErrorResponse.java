package com.integrador.marweld.core.exception;

public record ErrorResponse(
    String errorCode,
    String message
) {}
