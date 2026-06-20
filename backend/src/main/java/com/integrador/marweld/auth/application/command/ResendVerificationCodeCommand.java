package com.integrador.marweld.auth.application.command;

public record ResendVerificationCodeCommand(
        String correo
) {
}
