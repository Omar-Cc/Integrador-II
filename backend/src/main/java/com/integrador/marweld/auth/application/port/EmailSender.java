package com.integrador.marweld.auth.application.port;

public interface EmailSender {
    /**
     * Envía el correo electrónico de verificación de cuenta con el código OTP.
     *
     * @param to   Dirección de correo destino.
     * @param name Nombre del destinatario.
     * @param otp  Código de verificación numérico.
     */
    void sendVerificationEmail(String to, String name, String otp);
}
