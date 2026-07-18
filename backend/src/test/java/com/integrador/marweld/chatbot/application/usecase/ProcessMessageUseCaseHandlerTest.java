package com.integrador.marweld.chatbot.application.usecase;

import com.integrador.marweld.chatbot.application.command.ProcessMessageCommand;
import com.integrador.marweld.chatbot.application.port.CartPort;
import com.integrador.marweld.chatbot.application.port.LlmClientPort;
import com.integrador.marweld.chatbot.application.port.LlmPrompt;
import com.integrador.marweld.chatbot.application.port.LlmResponse;
import com.integrador.marweld.chatbot.application.port.LlmStreamingChunk;
import com.integrador.marweld.chatbot.application.port.ProductContext;
import com.integrador.marweld.chatbot.application.port.ProductContextPort;
import com.integrador.marweld.chatbot.application.result.MessageProcessResult;
import com.integrador.marweld.chatbot.domain.model.MensajeChatbot;
import com.integrador.marweld.chatbot.domain.model.SesionChatbot;
import com.integrador.marweld.chatbot.infrastructure.adapter.EmbeddingService;
import com.integrador.marweld.chatbot.infrastructure.persistence.repository.FaqChatbotRepository;
import com.integrador.marweld.chatbot.infrastructure.persistence.repository.MensajeChatbotRepository;
import com.integrador.marweld.chatbot.infrastructure.persistence.repository.ProductosMensajeChatbotRepository;
import com.integrador.marweld.chatbot.infrastructure.persistence.repository.SesionChatbotRepository;
import com.integrador.marweld.chatbot.infrastructure.persistence.repository.TelemetriaMensajeChatbotRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.function.Consumer;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProcessMessageUseCaseHandlerTest {

    @Mock
    private SesionChatbotRepository sesionChatbotRepository;

    @Mock
    private MensajeChatbotRepository mensajeChatbotRepository;

    @Mock
    private TelemetriaMensajeChatbotRepository telemetriaMensajeChatbotRepository;

    @Mock
    private ProductosMensajeChatbotRepository productosMensajeChatbotRepository;

    @Mock
    private FaqChatbotRepository faqChatbotRepository;

    @Mock
    private ProductContextPort productContextPort;

    @Mock
    private CartPort cartPort;

    @Mock
    private EmbeddingService embeddingService;

    private ProcessMessageUseCaseHandler handler;

    @BeforeEach
    void setUp() {
        handler = new ProcessMessageUseCaseHandler(
                sesionChatbotRepository,
                mensajeChatbotRepository,
                telemetriaMensajeChatbotRepository,
                productosMensajeChatbotRepository,
                faqChatbotRepository,
                productContextPort,
                cartPort,
                embeddingService,
                List.of(new FakeLlmClient()),
                "FAKE"
        );
    }

    @Test
    void handleUsesProductContextPortAndCartPort() {
        UUID sessionPublicId = UUID.randomUUID();
        SesionChatbot session = SesionChatbot.builder()
                .idSesionChatbot(1)
                .publicId(sessionPublicId)
                .tipoActor("VISITANTE")
                .idCarrito(44)
                .estado("ABIERTA")
                .build();
        ProductContext product = new ProductContext(
                9,
                UUID.randomUUID(),
                "Soldadura 7018",
                "Electrodo",
                new BigDecimal("10.50"),
                "kg",
                "ACTIVO",
                "Soldaduras",
                "Marweld",
                12
        );
        when(sesionChatbotRepository.findByPublicId(sessionPublicId)).thenReturn(Optional.of(session));
        when(mensajeChatbotRepository.save(any(MensajeChatbot.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(embeddingService.getEmbedding("quiero soldadura 7018")).thenReturn(List.of());
        when(faqChatbotRepository.findByEstado("ACTIVO")).thenReturn(List.of());
        when(productContextPort.findActiveProductsByKeywords(List.of("soldadura", "7018"))).thenReturn(List.of(product));
        when(cartPort.getCartSummary(44)).thenReturn("El carrito de compras esta vacio.");
        when(mensajeChatbotRepository.findTop10BySesionChatbotIdSesionChatbotOrderByFechaMensajeDesc(1)).thenReturn(List.of());

        MessageProcessResult result = handler.handle(new ProcessMessageCommand(sessionPublicId, "quiero soldadura 7018"));

        assertThat(result.botMessageContent()).contains("Respuesta fake");
        assertThat(result.matchedProductPublicIds()).containsExactly(product.publicId());
        verify(productContextPort).findActiveProductsByKeywords(List.of("soldadura", "7018"));
        verify(cartPort).getCartSummary(44);
    }

    private static class FakeLlmClient implements LlmClientPort {

        @Override
        public String getProviderName() {
            return "FAKE";
        }

        @Override
        public LlmResponse generateResponse(LlmPrompt prompt) {
            assertThat(prompt.matchedProducts()).hasSize(1);
            return new LlmResponse(
                    "Respuesta fake para " + prompt.matchedProducts().get(0).nombre(),
                    "CONSULTAR_PRODUCTO",
                    new BigDecimal("0.90"),
                    1,
                    1,
                    "fake",
                    null,
                    null
            );
        }

        @Override
        public void generateResponseStream(LlmPrompt prompt, Consumer<LlmStreamingChunk> chunkConsumer) {
            chunkConsumer.accept(new LlmStreamingChunk("Respuesta fake", true, "GENERAL", null, null));
        }
    }
}
