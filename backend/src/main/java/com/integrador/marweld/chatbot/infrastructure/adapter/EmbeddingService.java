package com.integrador.marweld.chatbot.infrastructure.adapter;

import com.integrador.marweld.chatbot.infrastructure.config.ChatbotProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

/**
 * Servicio encargado de invocar el API de Embeddings de Gemini para generar vectores de texto.
 */
@Service
public class EmbeddingService {

    private static final Logger log = LoggerFactory.getLogger(EmbeddingService.class);
    private final ChatbotProperties properties;
    private final RestTemplate restTemplate;

    public EmbeddingService(ChatbotProperties properties) {
        this.properties = properties;
        this.restTemplate = new RestTemplate();
    }

    /**
     * Genera un embedding vectorial de 768 dimensiones para el texto provisto.
     *
     * @param text Texto a vectorizar.
     * @return Lista de valores decimales representando el vector o lista vacía en caso de error.
     */
    @SuppressWarnings("unchecked")
    public List<Double> getEmbedding(String text) {
        String apiKey = properties.getLlm().getGemini().getApiKey();
        if (apiKey == null || apiKey.isBlank()) {
            log.warn("Gemini API key no está configurada. No se pueden generar embeddings.");
            return List.of();
        }

        try {
            String url = String.format(
                    "https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-2:embedContent?key=%s",
                    apiKey
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> part = Map.of("text", text);
            Map<String, Object> content = Map.of("parts", List.of(part));
            Map<String, Object> requestBody = Map.of(
                    "model", "models/gemini-embedding-2",
                    "content", content,
                    "outputDimensionality", 768
            );

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            Map<String, Object> response = restTemplate.postForObject(url, entity, Map.class);

            if (response != null && response.containsKey("embedding")) {
                Map<String, Object> embeddingObj = (Map<String, Object>) response.get("embedding");
                if (embeddingObj.containsKey("values")) {
                    return (List<Double>) embeddingObj.get("values");
                }
            }
            throw new IllegalStateException("Respuesta inválida de Gemini Embedding API");
        } catch (Exception e) {
            log.error("Error al generar embedding con Gemini: {}", e.getMessage(), e);
            return List.of();
        }
    }
}
