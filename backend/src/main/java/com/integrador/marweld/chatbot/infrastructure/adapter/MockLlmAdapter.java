package com.integrador.marweld.chatbot.infrastructure.adapter;

import com.integrador.marweld.catalog.domain.model.Producto;
import com.integrador.marweld.chatbot.application.port.LlmClientPort;
import com.integrador.marweld.chatbot.application.port.LlmPrompt;
import com.integrador.marweld.chatbot.application.port.LlmResponse;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

/**
 * Adaptador de infraestructura Mock que simula el procesamiento de un LLM de forma offline.
 * Útil para desarrollo local, pruebas unitarias y demostraciones sin costo.
 */
@Component
public class MockLlmAdapter implements LlmClientPort {

    @Override
    public String getProviderName() {
        return "MOCK";
    }

    @Override
    public LlmResponse generateResponse(LlmPrompt prompt) {
        StringBuilder sb = new StringBuilder();
        String intent = "GENERAL";
        BigDecimal confidence = new BigDecimal("0.85");

        // Heurística de respuesta simple RAG en memoria
        if (!prompt.matchedFaqs().isEmpty()) {
            sb.append("Según nuestras preguntas frecuentes:\n");
            sb.append(prompt.matchedFaqs().get(0).getRespuesta());
            intent = "FAQ";
            confidence = new BigDecimal("0.95");
        } else if (!prompt.matchedProducts().isEmpty()) {
            sb.append("¡Hola! Con gusto te ayudo con la información de catálogo. He encontrado estos productos activos:\n\n");
            for (Producto p : prompt.matchedProducts()) {
                String stockInfo = p.getNombre().toLowerCase().contains("soldadura") ? "45 unidades" : "15 unidades";
                sb.append(String.format("- **%s** (Categoría: %s, Tipo: %s):\n  Precio: S/. %.2f | Stock: %s.\n",
                        p.getNombre(),
                        p.getCategoria().getNombreCategoria(),
                        p.getTipoProducto().getNombre(),
                        p.getPrecio().doubleValue(),
                        stockInfo
                ));
            }
            sb.append("\n¿Deseas agregar alguno de estos productos a tu carrito?");
            intent = "CONSULTAR_PRODUCTO";
            confidence = new BigDecimal("0.90");
        } else {
            sb.append("Hola, soy el asistente experto de Marweld. Puedo ayudarte a consultar soldaduras, equipos e insumos de protección. ")
              .append("Prueba preguntándome sobre soldaduras WeldX o métodos de pago.");
        }

        return new LlmResponse(
                sb.toString(),
                intent,
                confidence,
                50, // tokens input mock
                120, // tokens output mock
                "mock-llama-3"
        );
    }
}
