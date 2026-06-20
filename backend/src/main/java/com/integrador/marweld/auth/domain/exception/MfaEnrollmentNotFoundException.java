package com.integrador.marweld.auth.domain.exception;

import com.integrador.marweld.core.exception.NotFoundException;

public class MfaEnrollmentNotFoundException extends NotFoundException {
    public MfaEnrollmentNotFoundException() {
        super("No existe un enrolamiento 2FA pendiente para el usuario.", "MFA_ENROLLMENT_NOT_FOUND");
    }
}
