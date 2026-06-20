package com.integrador.marweld.chatbot.application.port;

import java.math.BigDecimal;

/**
 * Record que representa la respuesta estructurada del modelo LLM.
 */
public record LlmResponse(
    String textResponse,
    String intent,
    BigDecimal confidence,
    Integer tokensInput,
    Integer tokensOutput,
    String modelUsed,
    String toolCallName,
    String toolCallArgsJson
) {
    public LlmResponse(
        String textResponse,
        String intent,
        BigDecimal confidence,
        Integer tokensInput,
        Integer tokensOutput,
        String modelUsed
    ) {
        this(textResponse, intent, confidence, tokensInput, tokensOutput, modelUsed, null, null);
    }
}
