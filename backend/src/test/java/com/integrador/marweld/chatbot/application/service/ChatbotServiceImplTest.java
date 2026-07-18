package com.integrador.marweld.chatbot.application.service;

import com.integrador.marweld.chatbot.api.request.AddCartItemRequest;
import com.integrador.marweld.chatbot.api.request.InitSessionRequest;
import com.integrador.marweld.chatbot.api.response.SessionResponse;
import com.integrador.marweld.chatbot.application.port.CartPort;
import com.integrador.marweld.chatbot.application.port.ClientResolverPort;
import com.integrador.marweld.chatbot.application.usecase.ProcessMessageUseCase;
import com.integrador.marweld.chatbot.domain.model.SesionChatbot;
import com.integrador.marweld.chatbot.infrastructure.persistence.repository.SesionChatbotRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ChatbotServiceImplTest {

    @Mock
    private SesionChatbotRepository sesionChatbotRepository;

    @Mock
    private ProcessMessageUseCase processMessageUseCase;

    @Mock
    private CartPort cartPort;

    @Mock
    private ClientResolverPort clientResolverPort;

    private ChatbotServiceImpl service;

    @BeforeEach
    void setUp() {
        service = new ChatbotServiceImpl(sesionChatbotRepository, processMessageUseCase, cartPort, clientResolverPort);
    }

    @Test
    void initSessionCreatesVisitorSessionWhenActorIsInvalid() {
        UUID cartPublicId = UUID.randomUUID();
        when(cartPort.getOrCreateCart(null, "visit-1")).thenReturn(10);
        when(cartPort.getCartPublicId(10)).thenReturn(Optional.of(cartPublicId));
        when(sesionChatbotRepository.save(any(SesionChatbot.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SessionResponse response = service.initSession(new InitSessionRequest("INVALIDO", null, null, "visit-1"));

        assertThat(response.tipoActor()).isEqualTo("VISITANTE");
        assertThat(response.tokenVisitante()).isEqualTo("visit-1");
        assertThat(response.cartPublicId()).isEqualTo(cartPublicId);
    }

    @Test
    void initSessionResolvesClientPublicIdBeforeCreatingCart() {
        UUID clientPublicId = UUID.randomUUID();
        when(clientResolverPort.resolveClientId(clientPublicId)).thenReturn(Optional.of(7));
        when(cartPort.getOrCreateCart(7, null)).thenReturn(20);
        when(cartPort.getCartPublicId(20)).thenReturn(Optional.empty());
        when(sesionChatbotRepository.save(any(SesionChatbot.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SessionResponse response = service.initSession(new InitSessionRequest("CLIENTE", null, clientPublicId.toString(), "ignored"));

        assertThat(response.tipoActor()).isEqualTo("CLIENTE");
        assertThat(response.tokenVisitante()).isNull();
        verify(clientResolverPort).resolveClientId(clientPublicId);
        verify(cartPort).getOrCreateCart(7, null);
    }

    @Test
    void addCartItemDelegatesToCartPortUsingSessionCart() {
        UUID sessionPublicId = UUID.randomUUID();
        UUID productPublicId = UUID.randomUUID();
        SesionChatbot session = SesionChatbot.builder().idCarrito(33).build();
        when(sesionChatbotRepository.findByPublicId(sessionPublicId)).thenReturn(Optional.of(session));

        service.addCartItem(sessionPublicId, new AddCartItemRequest(productPublicId, 2));

        verify(cartPort).addProductToCart(33, productPublicId, 2);
    }
}
