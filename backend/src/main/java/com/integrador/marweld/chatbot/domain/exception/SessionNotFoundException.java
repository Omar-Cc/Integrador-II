package com.integrador.marweld.chatbot.domain.exception;

import com.integrador.marweld.core.exception.NotFoundException;

import java.util.UUID;

/**
 * Excepción lanzada cuando una sesión de chatbot no es encontrada.
 */
public class SessionNotFoundException extends NotFoundException {
    public SessionNotFoundException(UUID publicId) {
        super("No se encontró la sesión de chatbot con ID: " + publicId, "CHATBOT_SESSION_NOT_FOUND");
    }
}
