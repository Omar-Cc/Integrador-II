package com.integrador.marweld.chatbot.api.response;

import java.util.UUID;

/**
 * Salida HTTP al iniciar una sesion de chatbot.
 */
public record SessionResponse(
        UUID sessionPublicId,
        String tipoActor,
        String tokenVisitante,
        UUID cartPublicId
) {}