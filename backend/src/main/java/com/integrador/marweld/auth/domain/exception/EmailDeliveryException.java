package com.integrador.marweld.auth.domain.exception;

import com.integrador.marweld.core.exception.AppException;

public class EmailDeliveryException extends AppException {
    public EmailDeliveryException(String message, Throwable cause) {
        super(message, "EMAIL_DELIVERY_ERROR", cause);
    }
}
