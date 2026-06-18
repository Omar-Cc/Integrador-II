package com.integrador.marweld.notifications.application.service;

import com.integrador.marweld.notifications.infrastructure.email.provider.EmailProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Implementación del servicio de correo electrónico.
 * Se encarga de delegar de forma dinámica al proveedor activo configurado
 * mediante la propiedad app.notifications.email.provider.
 */
@Service
public class EmailServiceImpl implements EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailServiceImpl.class);

    private final Map<String, EmailProvider> providers;
    private final String activeProviderName;

    public EmailServiceImpl(
            List<EmailProvider> providerList,
            @Value("${app.notifications.email.provider}") String activeProviderName) {
        
        this.providers = providerList.stream()
                .collect(Collectors.toMap(
                        p -> p.getProviderName().toUpperCase(),
                        p -> p
                ));
        this.activeProviderName = activeProviderName.trim().toUpperCase();
        
        log.info("Servicio EmailServiceImpl inicializado con la estrategia de proveedor activo: {}", this.activeProviderName);
        log.info("Estrategias de proveedores de correo cargadas y disponibles: {}", this.providers.keySet());
        
        if (!this.providers.containsKey(this.activeProviderName)) {
            log.warn("El proveedor activo configurado '{}' no se encuentra registrado en las estrategias cargadas: {}. Los envíos directos fallarán hasta que se configure un proveedor válido.", 
                    this.activeProviderName, this.providers.keySet());
        }
    }

    @Override
    public String sendEmail(String to, String subject, String htmlContent) {
        log.info("Petición recibida para despachar correo electrónico hacia: {}. Asunto: {}", to, subject);

        EmailProvider provider = providers.get(activeProviderName);
        if (provider == null) {
            log.error("No se pudo despachar el correo electrónico. El proveedor configurado '{}' no está registrado. Disponibles: {}", 
                    activeProviderName, providers.keySet());
            throw new IllegalStateException("El proveedor de correos '" + activeProviderName + "' no está soportado o no se encuentra cargado. Proveedores disponibles: " + providers.keySet());
        }

        try {
            return provider.send(to, subject, htmlContent);
        } catch (Exception e) {
            log.error("Error en la ejecución del proveedor de correos '{}' durante el envío: {}", activeProviderName, e.getMessage(), e);
            throw e;
        }
    }
}
