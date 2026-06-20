package com.integrador.marweld.chatbot.application.port;

/**
 * Record que representa un fragmento (chunk) de la respuesta de streaming del LLM.
 */
public record LlmStreamingChunk(
    String text,
    boolean done,
    String intent,
    String toolCallName,
    String toolCallArgsJson
) {}
