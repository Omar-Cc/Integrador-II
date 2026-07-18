package com.integrador.marweld.chatbot.application.usecase;

import com.integrador.marweld.chatbot.application.command.ProcessMessageCommand;
import com.integrador.marweld.chatbot.application.port.CartPort;
import com.integrador.marweld.chatbot.application.port.CartSummaryItem;
import com.integrador.marweld.chatbot.application.port.LlmClientPort;
import com.integrador.marweld.chatbot.application.port.LlmPrompt;
import com.integrador.marweld.chatbot.application.port.LlmResponse;
import com.integrador.marweld.chatbot.application.port.LlmStreamingChunk;
import com.integrador.marweld.chatbot.application.port.ProductContext;
import com.integrador.marweld.chatbot.application.port.ProductContextPort;
import com.integrador.marweld.chatbot.application.result.MessageProcessResult;
import com.integrador.marweld.chatbot.domain.exception.SessionClosedException;
import com.integrador.marweld.chatbot.domain.exception.SessionNotFoundException;
import com.integrador.marweld.chatbot.domain.model.FaqChatbot;
import com.integrador.marweld.chatbot.domain.model.MensajeChatbot;
import com.integrador.marweld.chatbot.domain.model.ProductosMensajeChatbot;
import com.integrador.marweld.chatbot.domain.model.ProductosMensajeChatbotId;
import com.integrador.marweld.chatbot.domain.model.RolProductoMensaje;
import com.integrador.marweld.chatbot.domain.model.SesionChatbot;
import com.integrador.marweld.chatbot.domain.model.TelemetriaMensajeChatbot;
import com.integrador.marweld.chatbot.infrastructure.adapter.EmbeddingService;
import com.integrador.marweld.chatbot.infrastructure.persistence.repository.FaqChatbotRepository;
import com.integrador.marweld.chatbot.infrastructure.persistence.repository.MensajeChatbotRepository;
import com.integrador.marweld.chatbot.infrastructure.persistence.repository.ProductosMensajeChatbotRepository;
import com.integrador.marweld.chatbot.infrastructure.persistence.repository.SesionChatbotRepository;
import com.integrador.marweld.chatbot.infrastructure.persistence.repository.TelemetriaMensajeChatbotRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Handler que orquesta la ejecucion del caso de uso ProcessMessageUseCase.
 */
@Component
public class ProcessMessageUseCaseHandler implements ProcessMessageUseCase {

    private static final Logger log = LoggerFactory.getLogger(ProcessMessageUseCaseHandler.class);

    private final SesionChatbotRepository sesionChatbotRepository;
    private final MensajeChatbotRepository mensajeChatbotRepository;
    private final TelemetriaMensajeChatbotRepository telemetriaMensajeChatbotRepository;
    private final ProductosMensajeChatbotRepository productosMensajeChatbotRepository;
    private final FaqChatbotRepository faqChatbotRepository;
    private final ProductContextPort productContextPort;
    private final CartPort cartPort;
    private final EmbeddingService embeddingService;
    private final Map<String, LlmClientPort> llmClients;
    private final String activeProvider;

    public ProcessMessageUseCaseHandler(
            SesionChatbotRepository sesionChatbotRepository,
            MensajeChatbotRepository mensajeChatbotRepository,
            TelemetriaMensajeChatbotRepository telemetriaMensajeChatbotRepository,
            ProductosMensajeChatbotRepository productosMensajeChatbotRepository,
            FaqChatbotRepository faqChatbotRepository,
            ProductContextPort productContextPort,
            CartPort cartPort,
            EmbeddingService embeddingService,
            List<LlmClientPort> llmClientList,
            @Value("${app.chatbot.llm.provider}") String activeProvider) {
        this.sesionChatbotRepository = sesionChatbotRepository;
        this.mensajeChatbotRepository = mensajeChatbotRepository;
        this.telemetriaMensajeChatbotRepository = telemetriaMensajeChatbotRepository;
        this.productosMensajeChatbotRepository = productosMensajeChatbotRepository;
        this.faqChatbotRepository = faqChatbotRepository;
        this.productContextPort = productContextPort;
        this.cartPort = cartPort;
        this.embeddingService = embeddingService;
        this.llmClients = llmClientList.stream()
                .collect(Collectors.toMap(client -> client.getProviderName().toUpperCase(), client -> client));
        this.activeProvider = activeProvider.trim().toUpperCase();
        log.info("process_message_use_case_initialized provider={}", this.activeProvider);
    }

    @Override
    @Transactional
    public MessageProcessResult handle(ProcessMessageCommand command) {
        log.info("process_message_start sessionPublicId={}", command.sessionPublicId());
        SesionChatbot session = getOpenSession(command);
        MensajeChatbot userMessage = saveUserMessage(session, command.content());

        List<FaqChatbot> matchedFaqs = findFaqMatches(command.content());
        List<ProductContext> matchedProducts = isCartSummaryRequest(command.content())
                ? List.of()
                : findProductMatches(command.content());
        String cartSummary = cartPort.getCartSummary(session.getIdCarrito());
        List<MensajeChatbot> conversationHistory = loadConversationHistory(session);

        LlmResponse llmResponse = getActiveLlmClient().generateResponse(new LlmPrompt(
                command.content(),
                session.getTipoActor(),
                matchedFaqs,
                matchedProducts,
                cartSummary,
                conversationHistory,
                session.getIdCarrito()
        ));

        MensajeChatbot botMessage = saveBotMessage(session, llmResponse.textResponse());
        saveTelemetry(botMessage, llmResponse.intent(), llmResponse.confidence(), llmResponse.modelUsed(), llmResponse.tokensInput(), llmResponse.tokensOutput());
        saveMessageProductTraceability(userMessage, botMessage, matchedProducts, llmResponse.textResponse());

        log.info("process_message_end botMessageId={}", botMessage.getIdMensajeChatbot());
        return new MessageProcessResult(
                session.getPublicId(),
                userMessage.getPublicId(),
                userMessage.getContenido(),
                userMessage.getFechaMensaje(),
                botMessage.getPublicId(),
                botMessage.getContenido(),
                botMessage.getFechaMensaje(),
                llmResponse.intent(),
                llmResponse.confidence(),
                llmResponse.toolCallName(),
                llmResponse.toolCallArgsJson(),
                getProductsMentionedInResponse(matchedProducts, llmResponse.textResponse()),
                getCartItemsForResponse(session, llmResponse)
        );
    }

    @Override
    public void handleStream(ProcessMessageCommand command, java.util.function.Consumer<LlmStreamingChunk> chunkConsumer) {
        log.info("process_message_stream_start sessionPublicId={}", command.sessionPublicId());
        SesionChatbot session = getOpenSession(command);
        MensajeChatbot savedUserMessage = mensajeChatbotRepository.save(MensajeChatbot.builder()
                .sesionChatbot(session)
                .emisor("USUARIO")
                .contenido(command.content())
                .fechaMensaje(LocalDateTime.now())
                .build());

        List<FaqChatbot> matchedFaqs = findFaqMatches(command.content());
        List<ProductContext> matchedProducts = isCartSummaryRequest(command.content())
                ? List.of()
                : findProductMatches(command.content());
        String cartSummary = cartPort.getCartSummary(session.getIdCarrito());
        List<MensajeChatbot> conversationHistory = loadConversationHistory(session);

        LlmPrompt llmPrompt = new LlmPrompt(
                command.content(),
                session.getTipoActor(),
                matchedFaqs,
                matchedProducts,
                cartSummary,
                conversationHistory,
                session.getIdCarrito()
        );

        StringBuilder fullTextResponse = new StringBuilder();
        final String[] finalIntent = new String[]{"GENERAL"};
        getActiveLlmClient().generateResponseStream(llmPrompt, chunk -> {
            chunkConsumer.accept(chunk);
            if (chunk.text() != null && !chunk.text().isBlank()) {
                fullTextResponse.append(chunk.text());
            }
            if (chunk.done()) {
                if (chunk.intent() != null) {
                    finalIntent[0] = chunk.intent();
                }
                try {
                    persistBotResponseAndTraceability(session, savedUserMessage, fullTextResponse.toString(), finalIntent[0], matchedProducts);
                } catch (Exception ex) {
                    log.error("persist_stream_bot_response_failed message={}", ex.getMessage(), ex);
                }
            }
        });
    }

    private SesionChatbot getOpenSession(ProcessMessageCommand command) {
        SesionChatbot session = sesionChatbotRepository.findByPublicId(command.sessionPublicId())
                .orElseThrow(() -> new SessionNotFoundException(command.sessionPublicId()));
        if ("CERRADA".equalsIgnoreCase(session.getEstado())) {
            throw new SessionClosedException(command.sessionPublicId());
        }
        return session;
    }

    private MensajeChatbot saveUserMessage(SesionChatbot session, String content) {
        return mensajeChatbotRepository.save(MensajeChatbot.builder()
                .sesionChatbot(session)
                .emisor("USUARIO")
                .contenido(content)
                .fechaMensaje(LocalDateTime.now())
                .build());
    }

    private MensajeChatbot saveBotMessage(SesionChatbot session, String content) {
        return mensajeChatbotRepository.save(MensajeChatbot.builder()
                .sesionChatbot(session)
                .emisor("BOT")
                .contenido(content)
                .fechaMensaje(LocalDateTime.now())
                .build());
    }

    private void saveTelemetry(MensajeChatbot botMessage, String intent, BigDecimal confidence, String modelUsed, Integer tokensInput, Integer tokensOutput) {
        telemetriaMensajeChatbotRepository.save(TelemetriaMensajeChatbot.builder()
                .mensajeChatbot(botMessage)
                .intentDetectado(intent)
                .confianzaIntent(confidence)
                .modeloUtilizado(modelUsed != null ? modelUsed : activeProvider)
                .tokensEntrada(tokensInput)
                .tokensSalida(tokensOutput)
                .latenciaMs(0)
                .build());
    }

    private void persistBotResponseAndTraceability(
            SesionChatbot session,
            MensajeChatbot userMessage,
            String responseText,
            String intent,
            List<ProductContext> matchedProducts) {
        MensajeChatbot botMessage = saveBotMessage(session, responseText);
        saveTelemetry(botMessage, intent, new BigDecimal("0.90"), activeProvider, 0, 0);
        saveMessageProductTraceability(userMessage, botMessage, matchedProducts, responseText);
    }

    private List<MensajeChatbot> loadConversationHistory(SesionChatbot session) {
        List<MensajeChatbot> history = mensajeChatbotRepository
                .findTop10BySesionChatbotIdSesionChatbotOrderByFechaMensajeDesc(session.getIdSesionChatbot());
        Collections.reverse(history);
        return history;
    }

    private LlmClientPort getActiveLlmClient() {
        LlmClientPort llmClient = llmClients.get(activeProvider);
        if (llmClient == null) {
            log.error("llm_provider_missing provider={}", activeProvider);
            throw new IllegalStateException("El proveedor de IA '" + activeProvider + "' no esta soportado o cargado.");
        }
        return llmClient;
    }

    private List<FaqChatbot> findFaqMatches(String message) {
        try {
            List<Double> embedding = embeddingService.getEmbedding(message);
            if (embedding != null && !embedding.isEmpty()) {
                log.info("faq_semantic_search_start");
                return faqChatbotRepository.findNearestFaqs(embedding.toString(), 5);
            }
        } catch (Exception ex) {
            log.warn("faq_semantic_search_failed fallback=keywords message={}", ex.getMessage());
        }

        List<FaqChatbot> allFaqs = faqChatbotRepository.findByEstado("ACTIVO");
        List<FaqChatbot> matchedFaqs = new ArrayList<>();
        String normalizedMsg = message.toLowerCase();
        for (FaqChatbot faq : allFaqs) {
            if (matchesFaq(normalizedMsg, faq)) {
                matchedFaqs.add(faq);
            }
        }
        return matchedFaqs;
    }

    private boolean matchesFaq(String normalizedMsg, FaqChatbot faq) {
        if (faq.getPalabrasClave() != null) {
            String[] keywords = faq.getPalabrasClave().split(",\\s*");
            for (String keyword : keywords) {
                if (normalizedMsg.contains(keyword.toLowerCase())) {
                    return true;
                }
            }
        }
        return normalizedMsg.contains(faq.getPregunta().toLowerCase());
    }

    private List<ProductContext> findProductMatches(String message) {
        return productContextPort.findActiveProductsByKeywords(extractKeywords(message));
    }

    /** Una consulta de resumen no debe activar el recuperador semántico de productos. */
    private boolean isCartSummaryRequest(String message) {
        if (message == null) {
            return false;
        }
        String normalized = message.toLowerCase();
        if (!normalized.contains("carrito")) {
            return false;
        }
        return List.of("agrega", "añade", "anade", "quitar", "elimina", "producto", "comprar")
                .stream()
                .noneMatch(normalized::contains);
    }

    /** Productos recomendados explícitamente por la respuesta, en el mismo orden del contexto. */
    private List<java.util.UUID> getProductsMentionedInResponse(
            List<ProductContext> matchedProducts,
            String botResponse) {
        if (botResponse == null || botResponse.isBlank()) {
            return List.of();
        }
        String normalizedResponse = botResponse.toLowerCase();
        return matchedProducts.stream()
                .filter(product -> normalizedResponse.contains(product.nombre().toLowerCase()))
                .map(ProductContext::publicId)
                .distinct()
                .toList();
    }

    /** Expone el carrito para que la interfaz lo presente como un resumen visual. */
    private List<CartSummaryItem> getCartItemsForResponse(SesionChatbot session, LlmResponse llmResponse) {
        boolean isCartSummary = "MODIFICAR_CARRITO".equals(llmResponse.intent())
                && llmResponse.toolCallName() == null;
        return isCartSummary ? cartPort.getCartItems(session.getIdCarrito()) : List.of();
    }

    private List<String> extractKeywords(String message) {
        if (message == null || message.isBlank()) {
            return List.of();
        }
        String cleaned = message.replaceAll("[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ ]", " ").toLowerCase();
        String[] tokens = cleaned.split("\\s+");
        List<String> stopwords = List.of(
                "de", "la", "el", "un", "con", "en", "para", "por", "que", "los", "las",
                "hola", "tienen", "tiene", "busco", "quiero", "como", "esta", "este",
                "necesito", "venden", "precio", "cuanto", "cuesta"
        );
        List<String> keywords = new ArrayList<>();
        for (String token : tokens) {
            if (token.length() >= 3 && !stopwords.contains(token)) {
                keywords.add(token);
            }
        }
        return keywords;
    }

    private void saveMessageProductTraceability(
            MensajeChatbot userMsg,
            MensajeChatbot botMsg,
            List<ProductContext> matchedProducts,
            String botResponse) {
        for (ProductContext product : matchedProducts) {
            productosMensajeChatbotRepository.save(ProductosMensajeChatbot.builder()
                    .id(ProductosMensajeChatbotId.builder()
                            .idMensajeChatbot(userMsg.getIdMensajeChatbot())
                            .idProducto(product.idProducto())
                            .rolProducto(RolProductoMensaje.MENCIONADO)
                            .build())
                    .mensajeChatbot(userMsg)
                    .build());
        }

        String botResponseLower = botResponse.toLowerCase();
        for (ProductContext product : matchedProducts) {
            if (botResponseLower.contains(product.nombre().toLowerCase())) {
                productosMensajeChatbotRepository.save(ProductosMensajeChatbot.builder()
                        .id(ProductosMensajeChatbotId.builder()
                                .idMensajeChatbot(botMsg.getIdMensajeChatbot())
                                .idProducto(product.idProducto())
                                .rolProducto(RolProductoMensaje.RECOMENDADO)
                                .build())
                        .mensajeChatbot(botMsg)
                        .build());
            }
        }
    }
}
