package com.integrador.marweld.orders.domain.exception;

import com.integrador.marweld.core.exception.ValidationException;

public class CheckoutValidationException extends ValidationException {
    public CheckoutValidationException(String message) {
        super(message, "CHECKOUT_VALIDATION_ERROR");
    }
}
