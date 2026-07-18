package com.integrador.marweld.chatbot;

import org.junit.jupiter.api.Test;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class ChatbotArchitectureTest {

    @Test
    void chatbotDoesNotUseJdbcSqlOrCatalogInfrastructureOutsidePersistence() throws Exception {
        Path root = Path.of("src/main/java/com/integrador/marweld/chatbot");
        List<Path> offenders = Files.walk(root)
                .filter(path -> path.toString().endsWith(".java"))
                .filter(path -> !path.toString().contains("infrastructure\\persistence"))
                .filter(path -> !path.toString().contains("infrastructure/persistence"))
                .filter(this::containsForbiddenText)
                .toList();

        assertThat(offenders).isEmpty();
    }

    private boolean containsForbiddenText(Path path) {
        try {
            String content = Files.readString(path);
            return content.contains("JdbcTemplate")
                    || content.contains("com.integrador.marweld.catalog")
                    || content.contains("\"SELECT ")
                    || content.contains("\"INSERT ")
                    || content.contains("\"UPDATE ")
                    || content.contains("\"DELETE ");
        } catch (Exception ex) {
            throw new IllegalStateException("No se pudo leer " + path, ex);
        }
    }
}