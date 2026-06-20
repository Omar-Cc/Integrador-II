package com.integrador.marweld.auth.application.command;

public record LoginCommand(String correo, String contrasena, String ip, String userAgent) {}
