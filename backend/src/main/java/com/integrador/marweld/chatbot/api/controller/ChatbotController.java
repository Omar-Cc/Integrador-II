package com.integrador.marweld.chatbot.api.controller;

import com.integrador.marweld.chatbot.api.request.AddCartItemRequest;
import com.integrador.marweld.chatbot.api.request.InitSessionRequest;
import com.integrador.marweld.chatbot.api.request.MessageRequest;
import com.integrador.marweld.chatbot.api.response.SessionResponse;
import com.integrador.marweld.chatbot.application.port.CartSummaryItem;
import com.integrador.marweld.chatbot.application.result.MessageProcessResult;
import com.integrador.marweld.chatbot.application.service.ChatbotService;
import com.integrador.marweld.core.api.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;
import java.util.UUID;

/**
 * Controlador REST para gestionar sesiones e interacciones con el chatbot.
 */
@RestController
@RequestMapping("/api/v1/chatbot")
@RequiredArgsConstructor
public class ChatbotController {

    private final ChatbotService chatbotService;

    /**
     * Inicializa una sesion de chat y asocia/recupera un carrito abierto.
     */
    @PostMapping("/sessions")
    public ResponseEntity<ApiResponse<SessionResponse>> initSession(@RequestBody InitSessionRequest request) {
        SessionResponse response = chatbotService.initSession(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Sesion de chatbot iniciada exitosamente.", response));
    }

    /**
     * Endpoint SSE que procesa un mensaje y envia la respuesta del LLM en tiempo real.
     */
    @PostMapping(value = "/sessions/{sessionPublicId}/messages/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamMessage(
            @PathVariable UUID sessionPublicId,
            @RequestBody MessageRequest request) {
        return chatbotService.streamMessage(sessionPublicId, request);
    }

    /**
     * Endpoint REST sincrono que procesa un mensaje y envia la respuesta en formato JSON.
     */
    @PostMapping("/sessions/{sessionPublicId}/messages")
    public ResponseEntity<ApiResponse<MessageProcessResult>> sendMessage(
            @PathVariable UUID sessionPublicId,
            @RequestBody MessageRequest request) {
        MessageProcessResult result = chatbotService.sendMessage(sessionPublicId, request);
        return ResponseEntity.ok(ApiResponse.success("Mensaje procesado exitosamente.", result));
    }

    /**
     * Agrega un producto al carrito de la sesion de chat.
     */
    @PostMapping("/sessions/{sessionPublicId}/cart/items")
    public ResponseEntity<ApiResponse<Void>> addCartItem(
            @PathVariable UUID sessionPublicId,
            @RequestBody AddCartItemRequest request) {
        chatbotService.addCartItem(sessionPublicId, request);
        return ResponseEntity.ok(ApiResponse.success("Producto sincronizado en el carrito.", null));
    }

    /**
     * Elimina un producto del carrito de la sesion de chat.
     */
    @DeleteMapping("/sessions/{sessionPublicId}/cart/items/{productPublicId}")
    public ResponseEntity<ApiResponse<Void>> removeCartItem(
            @PathVariable UUID sessionPublicId,
            @PathVariable UUID productPublicId) {
        chatbotService.removeCartItem(sessionPublicId, productPublicId);
        return ResponseEntity.ok(ApiResponse.success("Producto removido del carrito sincronizado.", null));
    }

    /** Obtiene el carrito asociado a la sesión para sincronizar la interfaz tras una recarga. */
    @GetMapping("/sessions/{sessionPublicId}/cart/items")
    public ResponseEntity<ApiResponse<List<CartSummaryItem>>> getCartItems(@PathVariable UUID sessionPublicId) {
        return ResponseEntity.ok(ApiResponse.success(
                "Carrito recuperado exitosamente.", chatbotService.getCartItems(sessionPublicId)));
    }
}
