package com.integrador.marweld.chatbot.application.port;

import com.integrador.marweld.catalog.domain.model.Producto;
import com.integrador.marweld.chatbot.domain.model.FaqChatbot;
import com.integrador.marweld.chatbot.domain.model.MensajeChatbot;

import java.util.List;

/**
 * Record que representa el prompt de contexto consolidado (RAG) para enviar al cliente LLM.
 */
public record LlmPrompt(
    String userMessage,
    String sessionActorType,
    List<FaqChatbot> matchedFaqs,
    List<Producto> matchedProducts,
    String cartSummary,
    List<MensajeChatbot> conversationHistory
) {}
