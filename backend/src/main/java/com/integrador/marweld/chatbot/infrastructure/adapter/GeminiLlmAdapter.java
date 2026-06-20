package com.integrador.marweld.chatbot.infrastructure.adapter;

import com.integrador.marweld.catalog.domain.model.Producto;
import com.integrador.marweld.chatbot.application.port.CartPort;
import org.springframework.jdbc.core.JdbcTemplate;
import com.integrador.marweld.chatbot.application.port.LlmClientPort;
import com.integrador.marweld.chatbot.application.port.LlmPrompt;
import com.integrador.marweld.chatbot.application.port.LlmResponse;
import com.integrador.marweld.chatbot.application.port.LlmStreamingChunk;
import com.integrador.marweld.chatbot.infrastructure.config.ChatbotProperties;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.*;

/**
 * Adaptador de infraestructura que consume el API de Google AI Gemini con soporte para
 * Streaming (streamGenerateContent) y llamadas a funciones (Function Calling / Tools) para el carrito.
 */
@Component
public class GeminiLlmAdapter implements LlmClientPort {

    private static final Logger log = LoggerFactory.getLogger(GeminiLlmAdapter.class);
    private final ChatbotProperties properties;
    private final CartPort cartPort;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;
    private final JdbcTemplate jdbcTemplate;

    public GeminiLlmAdapter(ChatbotProperties properties, CartPort cartPort, JdbcTemplate jdbcTemplate) {
        this.properties = properties;
        this.cartPort = cartPort;
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
        this.httpClient = HttpClient.newBuilder().build();
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public String getProviderName() {
        return "GEMINI";
    }

    @Override
    public LlmResponse generateResponse(LlmPrompt prompt) {
        log.info("Ejecutando consulta síncrona a Gemini mediante buffer de streaming...");
        StringBuilder sb = new StringBuilder();
        List<LlmStreamingChunk> lastChunk = new ArrayList<>();
        
        generateResponseStream(prompt, chunk -> {
            if (chunk.text() != null) {
                sb.append(chunk.text());
            }
            if (chunk.done()) {
                lastChunk.add(chunk);
            }
        });

        String text = sb.toString();
        String intent = lastChunk.isEmpty() ? "GENERAL" : lastChunk.get(0).intent();
        String toolCallName = lastChunk.isEmpty() ? null : lastChunk.get(0).toolCallName();
        String toolCallArgsJson = lastChunk.isEmpty() ? null : lastChunk.get(0).toolCallArgsJson();
        return new LlmResponse(
                text,
                intent,
                new BigDecimal("0.90"),
                0,
                0,
                properties.getLlm().getGemini().getModel(),
                toolCallName,
                toolCallArgsJson
        );
    }

    @Override
    public void generateResponseStream(LlmPrompt prompt, java.util.function.Consumer<LlmStreamingChunk> chunkConsumer) {
        executeStreamingCall(prompt, null, chunkConsumer);
    }

    @SuppressWarnings("unchecked")
    private void executeStreamingCall(LlmPrompt prompt, List<Map<String, Object>> extraMessages, java.util.function.Consumer<LlmStreamingChunk> chunkConsumer) {
        String apiKey = properties.getLlm().getGemini().getApiKey();
        if (apiKey == null || apiKey.isBlank()) {
            log.warn("Llamada a Gemini sin API Key configurada.");
            chunkConsumer.accept(new LlmStreamingChunk(
                    "Lo siento, el servicio de Gemini no está configurado (falta API Key). Por favor, contacta al administrador.",
                    true,
                    "SYSTEM_ERROR",
                    null,
                    null
            ));
            return;
        }

        try {
            String model = properties.getLlm().getGemini().getModel();
            if (model != null && model.startsWith("models/")) {
                model = model.substring("models/".length());
            }
            String url = String.format(
                    "https://generativelanguage.googleapis.com/v1beta/models/%s:streamGenerateContent?key=%s",
                    model, apiKey
            );

            // Construir los contenidos de la conversación
            List<Map<String, Object>> contents = new ArrayList<>();

            // 1. Cargar historial conversacional previo
            prompt.conversationHistory().forEach(msg -> {
                String role = "USUARIO".equalsIgnoreCase(msg.getEmisor()) ? "user" : "model";
                contents.add(Map.of(
                        "role", role,
                        "parts", List.of(Map.of("text", msg.getContenido()))
                ));
            });

            // 2. Si es una continuación por ejecución de Tool (segundo turno)
            if (extraMessages != null) {
                contents.addAll(extraMessages);
            } else {
                // Primer turno: Añadimos la consulta del usuario enriquecida con RAG
                String userQueryWithContext = buildRagedPrompt(prompt);
                contents.add(Map.of(
                        "role", "user",
                        "parts", List.of(Map.of("text", userQueryWithContext))
                ));
            }

            // 3. Declarar herramientas (Function Calling)
            List<Map<String, Object>> functionDeclarations = List.of(
                Map.of(
                    "name", "add_to_cart",
                    "description", "Agrega un producto al carrito de compras utilizando su publicId (UUID) y la cantidad.",
                    "parameters", Map.of(
                        "type", "OBJECT",
                        "properties", Map.of(
                            "productPublicId", Map.of("type", "STRING", "description", "El UUID público del producto a agregar."),
                            "cantidad", Map.of("type", "INTEGER", "description", "La cantidad de unidades a agregar (mayor a 0).")
                        ),
                        "required", List.of("productPublicId", "cantidad")
                    )
                ),
                Map.of(
                    "name", "remove_from_cart",
                    "description", "Elimina un producto del carrito de compras utilizando su publicId (UUID).",
                    "parameters", Map.of(
                        "type", "OBJECT",
                        "properties", Map.of(
                            "productPublicId", Map.of("type", "STRING", "description", "El UUID público del producto a eliminar.")
                        ),
                        "required", List.of("productPublicId")
                    )
                )
            );
            List<Map<String, Object>> tools = List.of(Map.of("functionDeclarations", functionDeclarations));

            // Armar cuerpo de la petición
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("contents", contents);
            requestBody.put("tools", tools);
            requestBody.put("systemInstruction", Map.of("parts", List.of(Map.of("text", buildSystemPrompt(prompt)))));
            requestBody.put("generationConfig", Map.of("temperature", properties.getLlm().getGemini().getTemperature()));

            String jsonPayload = objectMapper.writeValueAsString(requestBody);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                    .build();

            log.info("Invocando streaming de Gemini API...");
            HttpResponse<java.io.InputStream> response = httpClient.send(request, HttpResponse.BodyHandlers.ofInputStream());

            if (response.statusCode() != 200) {
                chunkConsumer.accept(new LlmStreamingChunk(
                        "Error al comunicarse con Gemini (HTTP " + response.statusCode() + ").",
                        true,
                        "SYSTEM_ERROR",
                        null,
                        null
                ));
                return;
            }

            String detectedToolName = null;
            JsonNode detectedToolArgs = null;
            StringBuilder textResponse = new StringBuilder();

            try (com.fasterxml.jackson.core.JsonParser parser = objectMapper.getFactory().createParser(response.body())) {
                com.fasterxml.jackson.core.JsonToken token = parser.nextToken();
                if (token == com.fasterxml.jackson.core.JsonToken.START_ARRAY) {
                    while (parser.nextToken() == com.fasterxml.jackson.core.JsonToken.START_OBJECT) {
                        JsonNode node = objectMapper.readTree(parser);
                        if (node.has("candidates")) {
                            JsonNode candidate = node.get("candidates").get(0);
                            if (candidate.has("content")) {
                                JsonNode contentNode = candidate.get("content");
                                if (contentNode.has("parts")) {
                                    JsonNode parts = contentNode.get("parts");
                                    for (JsonNode part : parts) {
                                        if (part.has("text")) {
                                            String chunkText = part.get("text").asText();
                                            textResponse.append(chunkText);
                                            chunkConsumer.accept(new LlmStreamingChunk(
                                                    chunkText,
                                                    false,
                                                    null,
                                                    null,
                                                    null
                                            ));
                                        } else if (part.has("functionCall")) {
                                            JsonNode fc = part.get("functionCall");
                                            detectedToolName = fc.get("name").asText();
                                            detectedToolArgs = fc.get("args");
                                        }
                                    }
                                }
                            }
                        }
                    }
                } else if (token == com.fasterxml.jackson.core.JsonToken.START_OBJECT) {
                    JsonNode node = objectMapper.readTree(parser);
                    if (node.has("candidates")) {
                        JsonNode candidate = node.get("candidates").get(0);
                        if (candidate.has("content")) {
                            JsonNode contentNode = candidate.get("content");
                            if (contentNode.has("parts")) {
                                JsonNode parts = contentNode.get("parts");
                                for (JsonNode part : parts) {
                                    if (part.has("text")) {
                                        String chunkText = part.get("text").asText();
                                        textResponse.append(chunkText);
                                        chunkConsumer.accept(new LlmStreamingChunk(
                                                chunkText,
                                                false,
                                                null,
                                                null,
                                                null
                                        ));
                                    } else if (part.has("functionCall")) {
                                        JsonNode fc = part.get("functionCall");
                                        detectedToolName = fc.get("name").asText();
                                        detectedToolArgs = fc.get("args");
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // Si el modelo solicita la ejecución de una herramienta (Tool/Function)
            if (detectedToolName != null) {
                log.info("Gemini solicitó la acción: {}", detectedToolName);
                String outputMessage = "Operación realizada con éxito.";
                
                try {
                    if ("add_to_cart".equalsIgnoreCase(detectedToolName)) {
                        UUID productPublicId = UUID.fromString(detectedToolArgs.get("productPublicId").asText());
                        int cantidad = detectedToolArgs.get("cantidad").asInt();
                        cartPort.addProductToCart(prompt.idCarrito(), productPublicId, cantidad);
                        outputMessage = "El producto fue agregado al carrito satisfactoriamente.";
                    } else if ("remove_from_cart".equalsIgnoreCase(detectedToolName)) {
                        UUID productPublicId = UUID.fromString(detectedToolArgs.get("productPublicId").asText());
                        cartPort.removeProductFromCart(prompt.idCarrito(), productPublicId);
                        outputMessage = "El producto fue removido del carrito satisfactoriamente.";
                    }
                } catch (Exception ex) {
                    log.error("Fallo al ejecutar herramienta del carrito: {}", ex.getMessage());
                    outputMessage = "Error al modificar el carrito: " + ex.getMessage();
                }

                // Preparar los turnos para la segunda llamada
                List<Map<String, Object>> nextTurns = new ArrayList<>();
                if (extraMessages == null) {
                    nextTurns.add(Map.of(
                            "role", "user",
                            "parts", List.of(Map.of("text", buildRagedPrompt(prompt)))
                    ));
                } else {
                    nextTurns.addAll(extraMessages);
                }

                // Turno 2: Respuesta del modelo solicitando la herramienta
                nextTurns.add(Map.of(
                        "role", "model",
                        "parts", List.of(Map.of(
                                "functionCall", Map.of(
                                        "name", detectedToolName,
                                        "args", objectMapper.convertValue(detectedToolArgs, Map.class)
                                )
                        ))
                ));

                // Turno 3: Respuesta del backend con el resultado de la ejecución
                nextTurns.add(Map.of(
                        "role", "tool",
                        "parts", List.of(Map.of(
                                "functionResponse", Map.of(
                                        "name", detectedToolName,
                                        "response", Map.of("output", outputMessage)
                                )
                        ))
                ));

                // Volver a llamar en modo streaming para recibir la confirmación redactada por la IA
                final String finalToolName = detectedToolName;
                final String finalToolArgs = objectMapper.writeValueAsString(detectedToolArgs);

                executeStreamingCall(prompt, nextTurns, chunk -> {
                    if (chunk.done()) {
                        // Enriquecer el chunk final indicando la acción para que el frontend sincronice Zustand
                        chunkConsumer.accept(new LlmStreamingChunk(
                                chunk.text(),
                                true,
                                "MODIFICAR_CARRITO",
                                finalToolName,
                                finalToolArgs
                        ));
                    } else {
                        chunkConsumer.accept(chunk);
                    }
                });

            } else {
                // Finalización exitosa sin herramientas
                String intent = detectIntentHeuristic(prompt.userMessage(), textResponse.toString());
                chunkConsumer.accept(new LlmStreamingChunk(
                        "",
                        true,
                        intent,
                        null,
                        null
                ));
            }

        } catch (Exception e) {
            log.error("Error en streaming con Gemini: {}", e.getMessage(), e);
            chunkConsumer.accept(new LlmStreamingChunk(
                    "Lo siento, ocurrió un error procesando tu respuesta.",
                    true,
                    "SYSTEM_ERROR",
                    null,
                    null
            ));
        }
    }

    private String buildSystemPrompt(LlmPrompt prompt) {
        StringBuilder sb = new StringBuilder();
        sb.append("Eres Marweld, el chatbot inteligente experto en soldaduras y herramientas de la empresa Marweld.\n");
        sb.append("Tu objetivo es asesorar al usuario de forma clara, amable y profesional.\n");
        sb.append("El usuario actual es un: ").append(prompt.sessionActorType()).append(".\n\n");

        sb.append("REGLAS ESTRICTAS DE NEGOCIO:\n");
        sb.append("1. Responde ÚNICAMENTE basándote en la información de productos y FAQs provista en el contexto.\n");
        sb.append("2. Si el usuario te pide comprar, añadir o quitar productos del carrito, utiliza exclusivamente las herramientas (tools) provistas para modificar el carrito.\n");
        sb.append("3. Si el usuario te pregunta por un producto que no está en la lista de productos activos, dile amablemente que actualmente no contamos con él.\n");
        sb.append("4. Para sugerir o recomendar alternativas, utiliza exclusivamente la lista de productos activos provistos.\n\n");

        sb.append("--- RESUMEN DEL CARRITO ACTUAL DEL USUARIO ---\n");
        sb.append(prompt.cartSummary()).append("\n");

        return sb.toString();
    }

    private String buildRagedPrompt(LlmPrompt prompt) {
        StringBuilder sb = new StringBuilder();
        
        if (!prompt.matchedFaqs().isEmpty()) {
            sb.append("FAQs encontradas en el sistema:\n");
            prompt.matchedFaqs().forEach(faq -> {
                sb.append("- Pregunta: ").append(faq.getPregunta()).append("\n");
                sb.append("  Respuesta: ").append(faq.getRespuesta()).append("\n");
            });
            sb.append("\n");
        }

        if (!prompt.matchedProducts().isEmpty()) {
            sb.append("Productos del catálogo encontrados:\n");
            prompt.matchedProducts().forEach(p -> {
                String marca = getProductMarca(p.getIdProducto());
                int stock = getProductStock(p.getIdProducto());
                sb.append("- ").append(p.getNombre())
                  .append(" (Marca: ").append(marca)
                  .append(", Categoria: ").append(p.getCategoria().getNombreCategoria())
                  .append("). Precio: S/. ").append(p.getPrecio())
                  .append(", Stock: ").append(stock)
                  .append(", UUID: ").append(p.getPublicId())
                  .append("\n");
            });
            sb.append("\n");
        }

        sb.append("Consulta del usuario: ").append(prompt.userMessage());
        return sb.toString();
    }

    private String getProductMarca(Integer idProducto) {
        try {
            return jdbcTemplate.queryForObject(
                "SELECT valor FROM especificaciones_producto WHERE id_producto = ? AND clave = 'marca'",
                String.class,
                idProducto
            );
        } catch (Exception e) {
            return "Genérica";
        }
    }

    private int getProductStock(Integer idProducto) {
        try {
            return jdbcTemplate.queryForObject(
                "SELECT stock_actual FROM inventarios WHERE id_producto = ?",
                Integer.class,
                idProducto
            );
        } catch (Exception e) {
            return 0;
        }
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
