package com.integrador.marweld.chatbot.api.controller;

import com.integrador.marweld.chatbot.application.command.ProcessMessageCommand;
import com.integrador.marweld.chatbot.application.result.MessageProcessResult;
import com.integrador.marweld.chatbot.application.port.CartPort;
import com.integrador.marweld.chatbot.application.usecase.ProcessMessageUseCase;
import com.integrador.marweld.chatbot.domain.model.SesionChatbot;
import com.integrador.marweld.chatbot.infrastructure.persistence.repository.SesionChatbotRepository;
import com.integrador.marweld.core.api.ApiResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

/**
 * Controlador REST para gestionar sesiones e interacciones de streaming con el chatbot.
 */
@RestController
@RequestMapping("/api/v1/chatbot")
public class ChatbotController {

    private static final Logger log = LoggerFactory.getLogger(ChatbotController.class);

    private final SesionChatbotRepository sesionChatbotRepository;
    private final ProcessMessageUseCase processMessageUseCase;
    private final CartPort cartPort;
    private final JdbcTemplate jdbcTemplate;
    private final ObjectMapper objectMapper;

    public ChatbotController(
            SesionChatbotRepository sesionChatbotRepository,
            ProcessMessageUseCase processMessageUseCase,
            CartPort cartPort,
            JdbcTemplate jdbcTemplate) {
        this.sesionChatbotRepository = sesionChatbotRepository;
        this.processMessageUseCase = processMessageUseCase;
        this.cartPort = cartPort;
        this.jdbcTemplate = jdbcTemplate;
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Inicializa una sesión de chat y asocia/recupera un carrito abierto de base de datos.
     */
    @PostMapping("/sessions")
    public ResponseEntity<ApiResponse<SessionResponse>> initSession(@RequestBody InitSessionRequest request) {
        log.info("Inicializando sesión de chatbot. Actor: {}, Cliente: {}, UUID: {}, Visitante: {}", 
                request.tipoActor(), request.idCliente(), request.clientPublicId(), request.tokenVisitante());

        String actorType = request.tipoActor() != null ? request.tipoActor().toUpperCase() : "VISITANTE";
        if (!List.of("CLIENTE", "TRABAJADOR", "VISITANTE").contains(actorType)) {
            actorType = "VISITANTE";
        }

        // Resolviendo idCliente a partir de clientPublicId si es provisto
        Integer finalIdCliente = request.idCliente();
        if (finalIdCliente == null && request.clientPublicId() != null && !request.clientPublicId().isBlank()) {
            try {
                UUID clientUuid = UUID.fromString(request.clientPublicId().trim());
                finalIdCliente = jdbcTemplate.queryForObject(
                        "SELECT id_cliente FROM clientes WHERE public_id = ?",
                        Integer.class,
                        clientUuid
                );
                log.info("UUID de cliente {} resuelto a idCliente: {}", clientUuid, finalIdCliente);
            } catch (Exception e) {
                log.warn("No se pudo resolver el UUID de cliente {}: {}", request.clientPublicId(), e.getMessage());
            }
        }

        // Crear u obtener un carrito abierto de la BD
        Integer idCarrito = cartPort.getOrCreateCart(finalIdCliente, request.tokenVisitante());

        // Crear la sesión del chatbot
        SesionChatbot session = SesionChatbot.builder()
                .tipoActor(actorType)
                .idCliente(finalIdCliente)
                .tokenVisitante(request.tokenVisitante())
                .idCarrito(idCarrito)
                .estado("ABIERTA")
                .fechaInicio(LocalDateTime.now())
                .build();

        session = sesionChatbotRepository.save(session);

        // Recuperar el UUID público del carrito
        UUID cartPublicId = null;
        try {
            cartPublicId = jdbcTemplate.queryForObject(
                    "SELECT public_id FROM carritos WHERE id_carrito = ?",
                    UUID.class,
                    idCarrito
            );
        } catch (Exception e) {
            log.warn("No se pudo recuperar el UUID público del carrito {}: {}", idCarrito, e.getMessage());
        }

        SessionResponse response = new SessionResponse(
                session.getPublicId(),
                session.getTipoActor(),
                session.getTokenVisitante(),
                cartPublicId
        );

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Sesión de chatbot iniciada exitosamente.", response));
    }

    /**
     * Endpoint SSE que procesa un mensaje y envía la respuesta del LLM en tiempo real.
     */
    @PostMapping(value = "/sessions/{sessionPublicId}/messages/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamMessage(
            @PathVariable UUID sessionPublicId,
            @RequestBody MessageRequest request) {

        log.info("Iniciando transmisión SSE para sesión: {}", sessionPublicId);
        // Timeout de 3 minutos
        SseEmitter emitter = new SseEmitter(180_000L);

        CompletableFuture.runAsync(() -> {
            try {
                ProcessMessageCommand command = new ProcessMessageCommand(sessionPublicId, request.content());
                processMessageUseCase.handleStream(command, chunk -> {
                    try {
                        if (chunk.text() != null && !chunk.text().isEmpty()) {
                            emitter.send(SseEmitter.event()
                                    .name("chunk")
                                    .data(Map.of("text", chunk.text())));
                        }

                        if (chunk.done()) {
                            if (chunk.toolCallName() != null) {
                                Map<String, Object> actionData = new HashMap<>();
                                actionData.put("action", chunk.toolCallName().toUpperCase());

                                try {
                                    JsonNode args = objectMapper.readTree(chunk.toolCallArgsJson());
                                    if (args.has("productPublicId")) {
                                        actionData.put("productPublicId", args.get("productPublicId").asText());
                                    }
                                    if (args.has("cantidad")) {
                                        actionData.put("cantidad", args.get("cantidad").asInt());
                                    }
                                } catch (Exception ex) {
                                    log.error("Fallo al parsear argumentos de tool en streaming: {}", ex.getMessage());
                                    actionData.put("error", "Fallo al parsear argumentos: " + ex.getMessage());
                                }

                                emitter.send(SseEmitter.event()
                                        .name("action")
                                        .data(actionData));
                            }

                            // Evento done
                            emitter.send(SseEmitter.event()
                                    .name("done")
                                    .data(Map.of("intent", chunk.intent() != null ? chunk.intent() : "GENERAL")));
                        }
                    } catch (Exception e) {
                        log.error("Error al enviar evento SSE: {}", e.getMessage());
                    }
                });

                emitter.complete();
                log.info("Transmisión SSE completada exitosamente para sesión: {}", sessionPublicId);
            } catch (Exception e) {
                log.error("Error en procesamiento de streaming SSE: {}", e.getMessage(), e);
                try {
                    emitter.send(SseEmitter.event()
                            .name("error")
                            .data(Map.of("message", e.getMessage() != null ? e.getMessage() : "Error interno")));
                } catch (Exception ignore) {}
                emitter.completeWithError(e);
            }
        });

        return emitter;
    }

    /**
     * Endpoint REST síncrono que procesa un mensaje y envía la respuesta en formato JSON.
     */
    @PostMapping("/sessions/{sessionPublicId}/messages")
    public ResponseEntity<ApiResponse<MessageProcessResult>> sendMessage(
            @PathVariable UUID sessionPublicId,
            @RequestBody MessageRequest request) {
        
        log.info("Procesando mensaje síncrono para sesión: {}", sessionPublicId);
        ProcessMessageCommand command = new ProcessMessageCommand(sessionPublicId, request.content());
        MessageProcessResult result = processMessageUseCase.handle(command);
        return ResponseEntity.ok(ApiResponse.success("Mensaje procesado exitosamente.", result));
    }

    /**
     * Agrega un producto al carrito de la sesión de chat (sincronización manual).
     */
    @PostMapping("/sessions/{sessionPublicId}/cart/items")
    public ResponseEntity<ApiResponse<Void>> addCartItem(
            @PathVariable UUID sessionPublicId,
            @RequestBody AddCartItemRequest request) {
        
        log.info("Sincronizando adición de producto al carrito en sesión {}: productPublicId: {}, cantidad: {}", 
                sessionPublicId, request.productPublicId(), request.cantidad());

        SesionChatbot session = sesionChatbotRepository.findByPublicId(sessionPublicId)
                .orElseThrow(() -> new com.integrador.marweld.chatbot.domain.exception.SessionNotFoundException(sessionPublicId));

        cartPort.addProductToCart(session.getIdCarrito(), request.productPublicId(), request.cantidad());

        return ResponseEntity.ok(ApiResponse.success("Producto sincronizado en el carrito.", null));
    }

    /**
     * Elimina un producto del carrito de la sesión de chat (sincronización manual).
     */
    @DeleteMapping("/sessions/{sessionPublicId}/cart/items/{productPublicId}")
    public ResponseEntity<ApiResponse<Void>> removeCartItem(
            @PathVariable UUID sessionPublicId,
            @PathVariable UUID productPublicId) {
        
        log.info("Sincronizando eliminación de producto del carrito en sesión {}: productPublicId: {}", 
                sessionPublicId, productPublicId);

        SesionChatbot session = sesionChatbotRepository.findByPublicId(sessionPublicId)
                .orElseThrow(() -> new com.integrador.marweld.chatbot.domain.exception.SessionNotFoundException(sessionPublicId));

        cartPort.removeProductFromCart(session.getIdCarrito(), productPublicId);

        return ResponseEntity.ok(ApiResponse.success("Producto removido del carrito sincronizado.", null));
    }

    // Contratos de entrada y salida
    public record InitSessionRequest(
            String tipoActor,
            Integer idCliente,
            String clientPublicId,
            String tokenVisitante
    ) {}

    public record SessionResponse(
            UUID sessionPublicId,
            String tipoActor,
            String tokenVisitante,
            UUID cartPublicId
    ) {}

    public record MessageRequest(
            String content
    ) {}

    public record AddCartItemRequest(
            UUID productPublicId,
            int cantidad
    ) {}
}
