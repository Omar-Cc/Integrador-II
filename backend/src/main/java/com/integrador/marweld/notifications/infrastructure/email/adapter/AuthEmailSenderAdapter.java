package com.integrador.marweld.notifications.infrastructure.email.adapter;

import com.integrador.marweld.auth.application.port.EmailSender;
import com.integrador.marweld.auth.domain.exception.EmailDeliveryException;
import com.integrador.marweld.notifications.application.service.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * Adaptador que conecta el puerto EmailSender de auth con el servicio de despacho de correos
 * de notifications, aislando la plantilla HTML y los detalles de infraestructura.
 */
@Component
public class AuthEmailSenderAdapter implements EmailSender {

    private static final Logger log = LoggerFactory.getLogger(AuthEmailSenderAdapter.class);

    private final EmailService emailService;

    public AuthEmailSenderAdapter(EmailService emailService) {
        this.emailService = emailService;
    }

    @Override
    public void sendVerificationEmail(String to, String name, String otp) {
        String asunto = "Verificación de tu cuenta Marweld";
        String contenidoHtml = String.format(
                "<div style='font-family: Arial, sans-serif; padding: 20px; color: #333;'>" +
                "<h2>¡Hola, %s!</h2>" +
                "<p>Tu cuenta en Marweld ha sido creada correctamente.</p>" +
                "<p>Por favor, valida tu dirección de correo electrónico utilizando el siguiente código de verificación:</p>" +
                "<div style='background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0; border-radius: 5px;'>%s</div>" +
                "<p>Este código expira en 15 minutos.</p>" +
                "<p>Si tú no solicitaste este registro, por favor ignora este correo.</p>" +
                "<br/>" +
                "<p>Atentamente,<br/>El equipo de Marweld</p>" +
                "</div>",
                name, otp
        );

        try {
            log.info("Enviando correo de verificación mediante adaptador de notificaciones a: {}", to);
            emailService.sendEmail(to, asunto, contenidoHtml);
            log.info("Correo de verificación despachado correctamente por el adaptador para: {}", to);
        } catch (Exception e) {
            log.error("Fallo del adaptador de notificaciones al despachar el correo de verificación para '{}': {}", to, e.getMessage(), e);
            throw new EmailDeliveryException("No se pudo enviar el correo de validación.", e);
        }
    }
}
