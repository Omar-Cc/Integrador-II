package com.integrador.marweld.chatbot.infrastructure.adapter;

import com.integrador.marweld.catalog.domain.model.Producto;
import com.integrador.marweld.chatbot.application.port.LlmClientPort;
import com.integrador.marweld.chatbot.application.port.LlmPrompt;
import com.integrador.marweld.chatbot.application.port.LlmResponse;
import com.integrador.marweld.chatbot.infrastructure.config.ChatbotProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Adaptador de infraestructura que consume el API de chat completions de OpenAI.
 */
@Component
public class OpenAiLlmAdapter implements LlmClientPort {

    private static final Logger log = LoggerFactory.getLogger(OpenAiLlmAdapter.class);
    private final ChatbotProperties properties;
    private final RestTemplate restTemplate;

    public OpenAiLlmAdapter(ChatbotProperties properties) {
        this.properties = properties;
        this.restTemplate = new RestTemplate();
    }

    @Override
    public String getProviderName() {
        return "OPENAI";
    }

    @Override
    @SuppressWarnings("unchecked")
    public LlmResponse generateResponse(LlmPrompt prompt) {
        String apiKey = properties.getLlm().getOpenai().getApiKey();
        if (apiKey == null || apiKey.isBlank()) {
            log.warn("Llamada a OpenAI sin API Key configurada. Retornando respuesta de fallback.");
            return new LlmResponse(
                    "Lo siento, el servicio de OpenAI no está configurado (falta API Key). Por favor, contacta al administrador.",
                    "SYSTEM_ERROR",
                    BigDecimal.ONE,
                    0,
                    0,
                    properties.getLlm().getOpenai().getModel()
            );
        }

        try {
            String url = "https://api.openai.com/v1/chat/completions";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            String systemMessage = buildSystemPrompt(prompt);

            List<Map<String, String>> messages = new ArrayList<>();
            messages.add(Map.of("role", "system", "content", systemMessage));

            // Historial de conversación
            prompt.conversationHistory().forEach(msg -> {
                String role = "USUARIO".equalsIgnoreCase(msg.getEmisor()) ? "user" : "assistant";
                messages.add(Map.of("role", role, "content", msg.getContenido()));
            });

            // Mensaje actual del usuario
            messages.add(Map.of("role", "user", "content", prompt.userMessage()));

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", properties.getLlm().getOpenai().getModel());
            requestBody.put("messages", messages);
            requestBody.put("temperature", properties.getLlm().getOpenai().getTemperature());

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            log.info("Invocando OpenAI API con modelo: {}", properties.getLlm().getOpenai().getModel());

            Map<String, Object> response = restTemplate.postForObject(url, entity, Map.class);
            if (response == null || !response.containsKey("choices")) {
                throw new IllegalStateException("Respuesta incorrecta de OpenAI API");
            }

            List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
            Map<String, Object> firstChoice = choices.get(0);
            Map<String, Object> message = (Map<String, Object>) firstChoice.get("message");
            String textResponse = (String) message.get("content");

            // Consumo de tokens
            Map<String, Object> usage = (Map<String, Object>) response.get("usage");
            Integer promptTokens = usage != null ? ((Number) usage.get("prompt_tokens")).intValue() : 0;
            Integer completionTokens = usage != null ? ((Number) usage.get("completion_tokens")).intValue() : 0;

            String intent = detectIntentHeuristic(prompt.userMessage(), textResponse);

            return new LlmResponse(
                    textResponse,
                    intent,
                    new BigDecimal("0.90"),
                    promptTokens,
                    completionTokens,
                    properties.getLlm().getOpenai().getModel()
            );

        } catch (Exception e) {
            log.error("Error al invocar OpenAI API: {}", e.getMessage(), e);
            throw new RuntimeException("Error en la comunicación con OpenAI: " + e.getMessage(), e);
        }
    }

    private String buildSystemPrompt(LlmPrompt prompt) {
        StringBuilder sb = new StringBuilder();
        sb.append("Eres Marweld, el chatbot inteligente experto en soldaduras de la empresa Marweld.\n");
        sb.append("Tu objetivo es asesorar de forma clara, amable y profesional al usuario.\n");
        sb.append("El usuario actual es un: ").append(prompt.sessionActorType()).append(".\n\n");

        sb.append("REGLAS ESTRICTAS DE NEGOCIO:\n");
        sb.append("1. Responde ÚNICAMENTE basándote en la información de productos y FAQs provista en el contexto.\n");
        sb.append("2. BAJO NINGUNA CIRCUNSTANCIA inventes productos, características, stock, ni precios que no figuren explícitamente en el contexto.\n");
        sb.append("3. Si el usuario te pregunta por un producto que no está en la lista de productos activos, dile amablemente que actualmente no contamos con él.\n");
        sb.append("4. Para sugerir o recomendar alternativas, utiliza exclusivamente la información de la lista de productos activos provistos.\n\n");

        if (!prompt.matchedFaqs().isEmpty()) {
            sb.append("--- PREGUNTAS FRECUENTES (FAQs) COINCIDENTES ---\n");
            prompt.matchedFaqs().forEach(faq -> {
                sb.append("Pregunta: ").append(faq.getPregunta()).append("\n");
                sb.append("Respuesta: ").append(faq.getRespuesta()).append("\n\n");
            });
        }

        if (!prompt.matchedProducts().isEmpty()) {
            sb.append("--- PRODUCTOS ACTIVOS DISPONIBLES EN EL CATÁLOGO ---\n");
            prompt.matchedProducts().forEach(p -> {
                sb.append("- Nombre: ").append(p.getNombre()).append("\n");
                sb.append("  Precio: S/. ").append(p.getPrecio()).append("\n");
                sb.append("  Unidad de Medida: ").append(p.getUnidadMedida()).append("\n");
                sb.append("  Categoría: ").append(p.getCategoria().getNombreCategoria()).append("\n");
                sb.append("  Tipo de Producto: ").append(p.getTipoProducto().getNombre()).append("\n");
                sb.append("  Descripción: ").append(p.getDescripcion() != null ? p.getDescripcion() : "Sin descripción comercial.").append("\n\n");
            });
        }

        sb.append("--- RESUMEN DEL CARRITO ACTUAL DEL USUARIO ---\n");
        sb.append(prompt.cartSummary()).append("\n\n");

        sb.append("Por favor responde de forma concisa y amigable.");
        return sb.toString();
    }

    private String detectIntentHeuristic(String userQuery, String botResponse) {
        String query = userQuery.toLowerCase();
        if (query.contains("carrito") || query.contains("agregar") || query.contains("quitar") || query.contains("eliminar") || query.contains("cantidad")) {
            return "MODIFICAR_CARRITO";
        }
        if (query.contains("precio") || query.contains("soldadura") || query.contains("tienen") || query.contains("producto") || query.contains("buscar") || query.contains("alambre") || query.contains("maquina")) {
            return "CONSULTAR_PRODUCTO";
        }
        if (query.contains("pago") || query.contains("horario") || query.contains("atencion") || query.contains("duda") || query.contains("pregunta")) {
            return "FAQ";
        }
        return "GENERAL";
    }
}
