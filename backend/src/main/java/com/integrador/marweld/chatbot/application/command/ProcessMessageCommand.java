package com.integrador.marweld.chatbot.application.command;

import java.util.UUID;

/**
 * Command interno que encapsula la petición para procesar un mensaje de chatbot.
 */
public record ProcessMessageCommand(
    UUID sessionPublicId,
    String content
) {}
