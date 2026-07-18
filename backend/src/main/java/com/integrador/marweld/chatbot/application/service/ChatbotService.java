package com.integrador.marweld.chatbot.application.service;

import com.integrador.marweld.chatbot.api.request.AddCartItemRequest;
import com.integrador.marweld.chatbot.api.request.InitSessionRequest;
import com.integrador.marweld.chatbot.api.request.MessageRequest;
import com.integrador.marweld.chatbot.api.response.SessionResponse;
import com.integrador.marweld.chatbot.application.port.CartSummaryItem;
import com.integrador.marweld.chatbot.application.result.MessageProcessResult;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;
import java.util.UUID;

/**
 * Fachada de aplicacion para las operaciones HTTP del chatbot.
 */
public interface ChatbotService {

    SessionResponse initSession(InitSessionRequest request);

    MessageProcessResult sendMessage(UUID sessionPublicId, MessageRequest request);

    SseEmitter streamMessage(UUID sessionPublicId, MessageRequest request);

    void addCartItem(UUID sessionPublicId, AddCartItemRequest request);

    void removeCartItem(UUID sessionPublicId, UUID productPublicId);

    List<CartSummaryItem> getCartItems(UUID sessionPublicId);
}
