package com.integrador.marweld.auth.domain.exception;

import com.integrador.marweld.core.exception.ForbiddenException;

public class AccountInactiveException extends ForbiddenException {
    public AccountInactiveException() { super("La cuenta se encuentra inactiva.", "ACCOUNT_INACTIVE"); }
}
