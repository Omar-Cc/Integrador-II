package com.integrador.marweld.chatbot.application.usecase;

import com.integrador.marweld.catalog.domain.model.Producto;
import com.integrador.marweld.catalog.infrastructure.persistence.repository.ProductoRepository;
import com.integrador.marweld.chatbot.application.command.ProcessMessageCommand;
import com.integrador.marweld.chatbot.application.port.CartPort;
import com.integrador.marweld.chatbot.application.port.LlmClientPort;
import com.integrador.marweld.chatbot.application.port.LlmPrompt;
import com.integrador.marweld.chatbot.application.port.LlmResponse;
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

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Handler que orquesta la ejecución del caso de uso ProcessMessageUseCase.
 * Aplica lógica de RAG buscando FAQs y productos relevantes y llama al cliente LLM activo.
 */
@Component
public class ProcessMessageUseCaseHandler implements ProcessMessageUseCase {

    private static final Logger log = LoggerFactory.getLogger(ProcessMessageUseCaseHandler.class);

    private final SesionChatbotRepository sesionChatbotRepository;
    private final MensajeChatbotRepository mensajeChatbotRepository;
    private final TelemetriaMensajeChatbotRepository telemetriaMensajeChatbotRepository;
    private final ProductosMensajeChatbotRepository productosMensajeChatbotRepository;
    private final FaqChatbotRepository faqChatbotRepository;
    private final ProductoRepository productoRepository;
    private final CartPort cartPort;
    private final Map<String, LlmClientPort> llmClients;
    private final String activeProvider;

    public ProcessMessageUseCaseHandler(
            SesionChatbotRepository sesionChatbotRepository,
            MensajeChatbotRepository mensajeChatbotRepository,
            TelemetriaMensajeChatbotRepository telemetriaMensajeChatbotRepository,
            ProductosMensajeChatbotRepository productosMensajeChatbotRepository,
            FaqChatbotRepository faqChatbotRepository,
            ProductoRepository productoRepository,
            CartPort cartPort,
            List<LlmClientPort> llmClientList,
            @Value("${app.chatbot.llm.provider}") String activeProvider) {
        
        this.sesionChatbotRepository = sesionChatbotRepository;
        this.mensajeChatbotRepository = mensajeChatbotRepository;
        this.telemetriaMensajeChatbotRepository = telemetriaMensajeChatbotRepository;
        this.productosMensajeChatbotRepository = productosMensajeChatbotRepository;
        this.faqChatbotRepository = faqChatbotRepository;
        this.productoRepository = productoRepository;
        this.cartPort = cartPort;
        this.llmClients = llmClientList.stream()
                .collect(Collectors.toMap(
                        client -> client.getProviderName().toUpperCase(),
                        client -> client
                ));
        this.activeProvider = activeProvider.trim().toUpperCase();

        log.info("ProcessMessageUseCaseHandler inicializado con el proveedor LLM activo: {}", this.activeProvider);
    }

    @Override
    @Transactional
    public MessageProcessResult handle(ProcessMessageCommand command) {
        log.info("Iniciando procesamiento de mensaje para la sesión: {}", command.sessionPublicId());

        // 1. Validar y recuperar la sesión
        SesionChatbot session = sesionChatbotRepository.findByPublicId(command.sessionPublicId())
                .orElseThrow(() -> new SessionNotFoundException(command.sessionPublicId()));

        if ("CERRADA".equalsIgnoreCase(session.getEstado())) {
            throw new SessionClosedException(command.sessionPublicId());
        }

        // 2. Persistir el mensaje del usuario
        MensajeChatbot userMessage = MensajeChatbot.builder()
                .sesionChatbot(session)
                .emisor("USUARIO")
                .contenido(command.content())
                .fechaMensaje(LocalDateTime.now())
                .build();
        userMessage = mensajeChatbotRepository.save(userMessage);

        // 3. RAG: Buscar FAQs y productos coincidentes
        List<FaqChatbot> matchedFaqs = findFaqMatches(command.content());
        List<Producto> matchedProducts = findProductMatches(command.content());

        // 4. Obtener el resumen del carrito
        String cartSummary = cartPort.getCartSummary(session.getIdCarrito());

        // 5. Cargar el historial conversacional
        List<MensajeChatbot> conversationHistory = mensajeChatbotRepository.findTop10BySesionChatbotIdSesionChatbotOrderByFechaMensajeDesc(session.getIdSesionChatbot());
        // Invertir el orden para que quede cronológico
        java.util.Collections.reverse(conversationHistory);

        // 6. Construir prompt y delegar al LlmClient activo
        LlmPrompt llmPrompt = new LlmPrompt(
                command.content(),
                session.getTipoActor(),
                matchedFaqs,
                matchedProducts,
                cartSummary,
                conversationHistory
        );

        LlmClientPort llmClient = llmClients.get(activeProvider);
        if (llmClient == null) {
            log.error("Proveedor LLM '{}' no está configurado o no existe en los componentes.", activeProvider);
            throw new IllegalStateException("El proveedor de IA '" + activeProvider + "' no está soportado o cargado.");
        }

        LlmResponse llmResponse = llmClient.generateResponse(llmPrompt);

        // 7. Persistir la respuesta del chatbot
        MensajeChatbot botMessage = MensajeChatbot.builder()
                .sesionChatbot(session)
                .emisor("BOT")
                .contenido(llmResponse.textResponse())
                .fechaMensaje(LocalDateTime.now())
                .build();
        botMessage = mensajeChatbotRepository.save(botMessage);

        // 8. Persistir la telemetría del mensaje
        TelemetriaMensajeChatbot telemetria = TelemetriaMensajeChatbot.builder()
                .mensajeChatbot(botMessage)
                .intentDetectado(llmResponse.intent())
                .confianzaIntent(llmResponse.confidence())
                .modeloUtilizado(llmResponse.modelUsed() != null ? llmResponse.modelUsed() : activeProvider) // agregamos fallback o usamos activeProvider
                .tokensEntrada(llmResponse.tokensInput())
                .tokensSalida(llmResponse.tokensOutput())
                .latenciaMs(0) // se puede calcular o mockear
                .build();
        telemetriaMensajeChatbotRepository.save(telemetria);

        // 9. Trazabilidad: Registrar productos mencionados/sugeridos en la base de datos
        saveMessageProductTraceability(userMessage, botMessage, matchedProducts, llmResponse.textResponse());

        log.info("Mensaje procesado con éxito. Respuesta del bot guardada con ID de mensaje: {}", botMessage.getIdMensajeChatbot());

        return new MessageProcessResult(
                session.getPublicId(),
                userMessage.getPublicId(),
                userMessage.getContenido(),
                userMessage.getFechaMensaje(),
                botMessage.getPublicId(),
                botMessage.getContenido(),
                botMessage.getFechaMensaje(),
                llmResponse.intent(),
                llmResponse.confidence()
        );
    }

    private List<FaqChatbot> findFaqMatches(String message) {
        List<FaqChatbot> allFaqs = faqChatbotRepository.findByEstado("ACTIVO");
        List<FaqChatbot> matchedFaqs = new ArrayList<>();
        String normalizedMsg = message.toLowerCase();

        for (FaqChatbot faq : allFaqs) {
            boolean isMatch = false;
            if (faq.getPalabrasClave() != null) {
                String[] kwFaq = faq.getPalabrasClave().split(",\\s*");
                for (String kw : kwFaq) {
                    if (normalizedMsg.contains(kw.toLowerCase())) {
                        isMatch = true;
                        break;
                    }
                }
            }
            if (!isMatch && normalizedMsg.contains(faq.getPregunta().toLowerCase())) {
                isMatch = true;
            }
            if (isMatch) {
                matchedFaqs.add(faq);
            }
        }
        return matchedFaqs;
    }

    private List<Producto> findProductMatches(String message) {
        List<String> keywords = extractKeywords(message);
        List<Producto> matched = new ArrayList<>();

        for (String kw : keywords) {
            List<Producto> prods = productoRepository.findByNombreContainingIgnoreCaseAndEstado(kw, "ACTIVO");
            for (Producto p : prods) {
                if (!matched.contains(p)) {
                    matched.add(p);
                }
            }
        }
        return matched;
    }

    private List<String> extractKeywords(String message) {
        if (message == null || message.isBlank()) {
            return List.of();
        }
        String cleaned = message.replaceAll("[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ ]", " ").toLowerCase();
        String[] tokens = cleaned.split("\\s+");
        List<String> stopwords = List.of(
                "de", "la", "el", "un", "con", "en", "para", "por", "que", "los", "las",
                "hola", "tienen", "tiene", "busco", "quiero", "tienen", "como", "esta",
                "este", "necesito", "tienen", "venden", "precio", "cuanto", "cuesta"
        );
        List<String> keywords = new ArrayList<>();
        for (String token : tokens) {
            if (token.length() >= 3 && !stopwords.contains(token)) {
                keywords.add(token);
            }
        }
        return keywords;
    }

    private void saveMessageProductTraceability(MensajeChatbot userMsg, MensajeChatbot botMsg, List<Producto> matchedProducts, String botResponse) {
        // Registrar productos mencionados por el usuario (los encontrados mediante keywords)
        for (Producto p : matchedProducts) {
            ProductosMensajeChatbotId userId = ProductosMensajeChatbotId.builder()
                    .idMensajeChatbot(userMsg.getIdMensajeChatbot())
                    .idProducto(p.getIdProducto())
                    .rolProducto(RolProductoMensaje.MENCIONADO)
                    .build();
            ProductosMensajeChatbot userTrace = ProductosMensajeChatbot.builder()
                    .id(userId)
                    .mensajeChatbot(userMsg)
                    .build();
            productosMensajeChatbotRepository.save(userTrace);
        }

        // Registrar productos recomendados por el bot (los que coinciden con el texto de la respuesta del bot)
        String botResponseLower = botResponse.toLowerCase();
        for (Producto p : matchedProducts) {
            if (botResponseLower.contains(p.getNombre().toLowerCase())) {
                ProductosMensajeChatbotId botId = ProductosMensajeChatbotId.builder()
                        .idMensajeChatbot(botMsg.getIdMensajeChatbot())
                        .idProducto(p.getIdProducto())
                        .rolProducto(RolProductoMensaje.RECOMENDADO)
                        .build();
                ProductosMensajeChatbot botTrace = ProductosMensajeChatbot.builder()
                        .id(botId)
                        .mensajeChatbot(botMsg)
                        .build();
                productosMensajeChatbotRepository.save(botTrace);
            }
        }
    }
}
