package com.integrador.marweld.auth.domain.exception;

import com.integrador.marweld.core.exception.AppException;

public class MfaEmailDeliveryException extends AppException {
    public MfaEmailDeliveryException(String message, Throwable cause) {
        super(message, "MFA_EMAIL_DELIVERY_ERROR", cause);
    }
}
