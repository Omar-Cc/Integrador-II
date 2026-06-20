package com.integrador.marweld.chatbot.application.port;

/**
 * Puerto de interfaz agnóstica para interactuar con clientes de IA / LLM.
 */
public interface LlmClientPort {

    /**
     * Obtiene el identificador del proveedor de IA.
     *
     * @return Nombre del proveedor (ej. 'MOCK', 'OPENAI', 'GEMINI').
     */
    String getProviderName();

    /**
     * Envía el prompt estructurado con contexto al modelo y retorna la respuesta procesada.
     *
     * @param prompt Objeto de prompt estructurado.
     * @return Respuesta estructurada del LLM.
     */
    LlmResponse generateResponse(LlmPrompt prompt);
}
