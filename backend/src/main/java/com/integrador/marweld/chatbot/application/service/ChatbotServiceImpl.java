package com.integrador.marweld.chatbot.application.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.integrador.marweld.chatbot.api.request.AddCartItemRequest;
import com.integrador.marweld.chatbot.api.request.InitSessionRequest;
import com.integrador.marweld.chatbot.api.request.MessageRequest;
import com.integrador.marweld.chatbot.api.response.SessionResponse;
import com.integrador.marweld.chatbot.application.command.ProcessMessageCommand;
import com.integrador.marweld.chatbot.application.port.CartPort;
import com.integrador.marweld.chatbot.application.port.ClientResolverPort;
import com.integrador.marweld.chatbot.application.result.MessageProcessResult;
import com.integrador.marweld.chatbot.application.usecase.ProcessMessageUseCase;
import com.integrador.marweld.chatbot.domain.exception.SessionNotFoundException;
import com.integrador.marweld.chatbot.domain.model.SesionChatbot;
import com.integrador.marweld.chatbot.infrastructure.persistence.repository.SesionChatbotRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

/**
 * Implementacion de la fachada del chatbot.
 */
@Service
@RequiredArgsConstructor
public class ChatbotServiceImpl implements ChatbotService {

    private static final Logger log = LoggerFactory.getLogger(ChatbotServiceImpl.class);
    private static final long SSE_TIMEOUT_MS = 180_000L;

    private final SesionChatbotRepository sesionChatbotRepository;
    private final ProcessMessageUseCase processMessageUseCase;
    private final CartPort cartPort;
    private final ClientResolverPort clientResolverPort;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    @Transactional
    public SessionResponse initSession(InitSessionRequest request) {
        Integer idCliente = resolveClientId(request);
        String actorType = resolveActorType(request.tipoActor(), idCliente);
        String tokenVisitante = resolveVisitorToken(actorType, request.tokenVisitante());

        log.info("init_chatbot_session actorType={} idCliente={} hasVisitorToken={}", actorType, idCliente, tokenVisitante != null);

        Integer idCarrito = cartPort.getOrCreateCart(idCliente, tokenVisitante);
        SesionChatbot saved = sesionChatbotRepository.save(SesionChatbot.builder()
                .tipoActor(actorType)
                .idCliente(idCliente)
                .tokenVisitante(tokenVisitante)
                .idCarrito(idCarrito)
                .estado("ABIERTA")
                .fechaInicio(LocalDateTime.now())
                .build());

        return new SessionResponse(
                saved.getPublicId(),
                saved.getTipoActor(),
                saved.getTokenVisitante(),
                cartPort.getCartPublicId(idCarrito).orElse(null)
        );
    }

    @Override
    public MessageProcessResult sendMessage(UUID sessionPublicId, MessageRequest request) {
        ProcessMessageCommand command = new ProcessMessageCommand(sessionPublicId, request.content());
        return processMessageUseCase.handle(command);
    }

    @Override
    public SseEmitter streamMessage(UUID sessionPublicId, MessageRequest request) {
        SseEmitter emitter = new SseEmitter(SSE_TIMEOUT_MS);
        ProcessMessageCommand command = new ProcessMessageCommand(sessionPublicId, request.content());
        CompletableFuture.runAsync(() -> streamAsync(command, emitter));
        return emitter;
    }

    @Override
    @Transactional
    public void addCartItem(UUID sessionPublicId, AddCartItemRequest request) {
        SesionChatbot session = findSession(sessionPublicId);
        cartPort.addProductToCart(session.getIdCarrito(), request.productPublicId(), request.cantidad());
    }

    @Override
    @Transactional
    public void removeCartItem(UUID sessionPublicId, UUID productPublicId) {
        SesionChatbot session = findSession(sessionPublicId);
        cartPort.removeProductFromCart(session.getIdCarrito(), productPublicId);
    }

    @Override
    @Transactional(readOnly = true)
    public java.util.List<com.integrador.marweld.chatbot.application.port.CartSummaryItem> getCartItems(UUID sessionPublicId) {
        return cartPort.getCartItems(findSession(sessionPublicId).getIdCarrito());
    }

    private void streamAsync(ProcessMessageCommand command, SseEmitter emitter) {
        try {
            processMessageUseCase.handleStream(command, chunk -> {
                try {
                    if (chunk.text() != null && !chunk.text().isEmpty()) {
                        emitter.send(SseEmitter.event().name("chunk").data(Map.of("text", chunk.text())));
                    }
                    if (chunk.done()) {
                        sendToolActionIfPresent(chunk.toolCallName(), chunk.toolCallArgsJson(), emitter);
                        emitter.send(SseEmitter.event().name("done")
                                .data(Map.of("intent", chunk.intent() != null ? chunk.intent() : "GENERAL")));
                    }
                } catch (Exception ex) {
                    log.error("send_sse_event_failed message={}", ex.getMessage(), ex);
                }
            });
            emitter.complete();
        } catch (Exception ex) {
            log.error("stream_chatbot_message_failed sessionPublicId={}", command.sessionPublicId(), ex);
            try {
                emitter.send(SseEmitter.event().name("error")
                        .data(Map.of("message", ex.getMessage() != null ? ex.getMessage() : "Error interno")));
            } catch (Exception ignored) {
                // El canal SSE puede estar cerrado por el cliente.
            }
            emitter.completeWithError(ex);
        }
    }

    private void sendToolActionIfPresent(String toolCallName, String toolCallArgsJson, SseEmitter emitter) throws Exception {
        if (toolCallName == null) {
            return;
        }
        Map<String, Object> actionData = new HashMap<>();
        actionData.put("action", toolCallName.toUpperCase());
        try {
            JsonNode args = objectMapper.readTree(toolCallArgsJson);
            if (args.has("productPublicId")) {
                actionData.put("productPublicId", args.get("productPublicId").asText());
            }
            if (args.has("cantidad")) {
                actionData.put("cantidad", args.get("cantidad").asInt());
            }
        } catch (Exception ex) {
            log.error("parse_tool_args_failed message={}", ex.getMessage());
            actionData.put("error", "Fallo al parsear argumentos: " + ex.getMessage());
        }
        emitter.send(SseEmitter.event().name("action").data(actionData));
    }

    private SesionChatbot findSession(UUID sessionPublicId) {
        return sesionChatbotRepository.findByPublicId(sessionPublicId)
                .orElseThrow(() -> new SessionNotFoundException(sessionPublicId));
    }

    private Integer resolveClientId(InitSessionRequest request) {
        Integer idCliente = request.idCliente();
        if (idCliente != null || request.clientPublicId() == null || request.clientPublicId().isBlank()) {
            return idCliente;
        }
        try {
            UUID clientPublicId = UUID.fromString(request.clientPublicId().trim());
            Optional<Integer> resolved = clientResolverPort.resolveClientId(clientPublicId);
            resolved.ifPresent(value -> log.info("client_public_id_resolved clientPublicId={} idCliente={}", clientPublicId, value));
            return resolved.orElse(null);
        } catch (IllegalArgumentException ex) {
            log.warn("invalid_client_public_id clientPublicId={}", request.clientPublicId());
            return null;
        }
    }

    private String resolveActorType(String requestedActorType, Integer idCliente) {
        String normalized = requestedActorType != null ? requestedActorType.trim().toUpperCase() : "VISITANTE";
        if ("CLIENTE".equals(normalized) && idCliente != null) {
            return "CLIENTE";
        }
        return "VISITANTE";
    }

    private String resolveVisitorToken(String actorType, String requestedToken) {
        if (!"VISITANTE".equals(actorType)) {
            return null;
        }
        if (requestedToken != null && !requestedToken.isBlank()) {
            return requestedToken;
        }
        return "visitante-" + UUID.randomUUID().toString().substring(0, 8);
    }
}
