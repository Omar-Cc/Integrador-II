package com.integrador.marweld.chatbot.application.result;

import com.integrador.marweld.chatbot.application.port.CartSummaryItem;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
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
    BigDecimal confidence,
    String toolCallName,
    String toolCallArgsJson,
    List<UUID> matchedProductPublicIds,
    List<CartSummaryItem> cartItems
) {
    public MessageProcessResult(
        UUID sessionPublicId,
        UUID userMessagePublicId,
        String userMessageContent,
        LocalDateTime userMessageDate,
        UUID botMessagePublicId,
        String botMessageContent,
        LocalDateTime botMessageDate,
        String intent,
        BigDecimal confidence
    ) {
        this(sessionPublicId, userMessagePublicId, userMessageContent, userMessageDate,
             botMessagePublicId, botMessageContent, botMessageDate, intent, confidence, null, null, List.of(), List.of());
    }
}
