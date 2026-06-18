package com.integrador.marweld.auth.application.command;

public record VerifyEmailCommand(
        String correo,
        String codigo
) {
}
