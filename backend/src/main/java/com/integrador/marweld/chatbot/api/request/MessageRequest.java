package com.integrador.marweld.chatbot.api.request;

/**
 * Entrada HTTP para enviar un mensaje al chatbot.
 */
public record MessageRequest(
        String content
) {}