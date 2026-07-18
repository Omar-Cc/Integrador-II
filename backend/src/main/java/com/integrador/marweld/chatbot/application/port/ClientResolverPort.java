package com.integrador.marweld.chatbot.application.port;

import java.util.Optional;
import java.util.UUID;

/**
 * Puerto para resolver clientes externos hacia identificadores internos.
 */
public interface ClientResolverPort {

    /**
     * Resuelve el identificador interno de cliente desde su UUID publico.
     *
     * @param clientPublicId UUID publico del cliente
     * @return identificador interno del cliente, si existe
     */
    Optional<Integer> resolveClientId(UUID clientPublicId);
}