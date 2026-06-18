package com.integrador.marweld.chatbot.application.result;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Result que encapsula la respuesta y auditoría tras procesar un mensaje del chatbot.
 */
public record MessageProcessResult(
    UUID sessionPublicId,
    UUID userMessagePublicId,
    String userMessageContent,
    LocalDateTime userMessageDate,
    UUID botMessagePublicId,
    String botMessageContent,
    LocalDateTime botMessageDate,
    String intent,
    BigDecimal confidence
) {}
