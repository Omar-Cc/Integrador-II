package com.integrador.marweld.auth.application.command;

public record RegisterCommand(
    String nombre,
    String correo,
    String contrasena,
    String telefono,
    String documento,
    String direccion
) {}
