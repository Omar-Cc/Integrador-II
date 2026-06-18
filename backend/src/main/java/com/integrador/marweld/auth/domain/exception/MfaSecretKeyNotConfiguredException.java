package com.integrador.marweld.auth.domain.exception;

import com.integrador.marweld.core.exception.AppException;

public class MfaSecretKeyNotConfiguredException extends AppException {
    public MfaSecretKeyNotConfiguredException() {
        super("La clave de cifrado de secretos MFA no esta configurada.", "MFA_SECRET_KEY_NOT_CONFIGURED");
    }
}
