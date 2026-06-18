package com.integrador.marweld.auth.application.command;

public record ConfirmMfaCodeCommand(String correo, String codigo) {
}
