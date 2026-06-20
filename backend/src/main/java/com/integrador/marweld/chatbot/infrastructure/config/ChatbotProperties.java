package com.integrador.marweld.chatbot.infrastructure.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Propiedades de configuración tipadas para el módulo de chatbot.
 */
@Configuration
@ConfigurationProperties(prefix = "app.chatbot")
@Getter
@Setter
public class ChatbotProperties {

    private Llm llm = new Llm();

    @Getter
    @Setter
    public static class Llm {
        private String provider = "MOCK";
        private OpenAi openai = new OpenAi();
        private Gemini gemini = new Gemini();
    }

    @Getter
    @Setter
    public static class OpenAi {
        private String apiKey = "";
        private String model = "gpt-4o-mini";
        private Double temperature = 0.1;
    }

    @Getter
    @Setter
    public static class Gemini {
        private String apiKey = "";
        private String model = "gemini-1.5-flash";
        private Double temperature = 0.1;
    }
}
