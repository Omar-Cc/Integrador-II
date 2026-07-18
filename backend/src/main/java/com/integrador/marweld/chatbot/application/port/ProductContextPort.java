package com.integrador.marweld.chatbot.application.port;

import java.util.List;

/**
 * Puerto para recuperar contexto de productos relevantes para el chatbot.
 */
public interface ProductContextPort {

    /**
     * Busca productos activos relacionados con las palabras clave del mensaje.
     *
     * @param keywords palabras clave normalizadas
     * @return productos relevantes para el prompt
     */
    List<ProductContext> findActiveProductsByKeywords(List<String> keywords);
}