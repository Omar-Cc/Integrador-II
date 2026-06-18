package com.integrador.marweld.chatbot.domain.exception;

import java.util.UUID;

/**
 * Excepción lanzada al intentar interactuar con una sesión de chatbot ya cerrada.
 */
public class SessionClosedException extends ChatbotException {
    public SessionClosedException(UUID publicId) {
        super("La sesión de chatbot con ID: " + publicId + " ya está cerrada.", "CHATBOT_SESSION_CLOSED");
    }
}
