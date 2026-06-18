package com.integrador.marweld.notifications.infrastructure.email.provider;

import com.resend.Resend;
import com.resend.services.emails.model.CreateEmailOptions;
import com.resend.services.emails.model.CreateEmailResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Implementación del proveedor de correos utilizando el SDK de Resend.
 */
@Component
public class ResendEmailProvider implements EmailProvider {

    private static final Logger log = LoggerFactory.getLogger(ResendEmailProvider.class);

    @Value("${app.resend.api-key}")
    private String apiKey;

    @Value("${app.resend.from-email}")
    private String fromEmail;

    @Override
    public String send(String to, String subject, String htmlContent) {
        log.info("Enviando correo electrónico mediante el proveedor de Resend a: {}", to);
        
        if (apiKey == null || apiKey.trim().isEmpty() || apiKey.contains("mock_key")) {
            log.error("La clave API de Resend está vacía o contiene un valor mock.");
            throw new IllegalStateException("Error de configuración: La clave 'app.resend.api-key' está vacía o mal configurada.");
        }

        try {
            Resend resend = new Resend(apiKey);
            CreateEmailOptions options = CreateEmailOptions.builder()
                    .from(fromEmail)
                    .to(to)
                    .subject(subject)
                    .html(htmlContent)
                    .build();
            
            CreateEmailResponse response = resend.emails().send(options);
            log.info("Correo electrónico enviado con éxito a través de Resend. ID de Respuesta: {}", response.getId());
            return response.getId();
        } catch (Exception e) {
            log.error("Fallo al transmitir el correo electrónico a través de Resend hacia {}: {}", to, e.getMessage(), e);
            throw new RuntimeException("Fallo en el despacho de correo por parte de Resend: " + e.getMessage(), e);
        }
    }

    @Override
    public String getProviderName() {
        return "RESEND";
    }
}
