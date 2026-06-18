package com.integrador.marweld.chatbot.domain.exception;

import com.integrador.marweld.core.exception.DomainException;

/**
 * Excepción base para el módulo de chatbot.
 */
public abstract class ChatbotException extends DomainException {
    protected ChatbotException(String message, String errorCode) {
        super(message, errorCode);
    }
}
