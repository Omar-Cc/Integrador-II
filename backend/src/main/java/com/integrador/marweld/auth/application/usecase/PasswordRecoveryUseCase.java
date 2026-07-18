package com.integrador.marweld.auth.application.usecase;

public interface PasswordRecoveryUseCase {
    void requestReset(String correo);
    void confirmReset(String correo, String codigo, String contrasena);
}
