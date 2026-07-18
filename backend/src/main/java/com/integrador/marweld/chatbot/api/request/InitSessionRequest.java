package com.integrador.marweld.chatbot.api.request;

/**
 * Entrada HTTP para iniciar una sesion de chatbot.
 */
public record InitSessionRequest(
        String tipoActor,
        Integer idCliente,
        String clientPublicId,
        String tokenVisitante
) {}