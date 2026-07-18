package com.integrador.marweld.auth.infrastructure.adapter;

import com.integrador.marweld.auth.infrastructure.persistence.repository.ClienteRepository;
import com.integrador.marweld.chatbot.application.port.ClientResolverPort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

/**
 * Adapter de auth para resolver clientes consumidos por chatbot.
 */
@Component
@RequiredArgsConstructor
public class AuthClientResolverAdapter implements ClientResolverPort {

    private final ClienteRepository clienteRepository;

    @Override
    @Transactional(readOnly = true)
    public Optional<Integer> resolveClientId(UUID clientPublicId) {
        return clienteRepository.findByPublicId(clientPublicId)
                .map(cliente -> cliente.getIdCliente());
    }
}