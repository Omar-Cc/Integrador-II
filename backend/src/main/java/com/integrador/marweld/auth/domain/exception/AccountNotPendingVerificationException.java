package com.integrador.marweld.auth.domain.exception;

import com.integrador.marweld.core.exception.ConflictException;

public class AccountNotPendingVerificationException extends ConflictException {
    public AccountNotPendingVerificationException() {
        super("La cuenta no se encuentra pendiente de verificacion de correo.", "ACCOUNT_NOT_PENDING_VERIFICATION");
    }
}
