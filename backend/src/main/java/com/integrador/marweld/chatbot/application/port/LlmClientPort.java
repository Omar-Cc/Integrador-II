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

    /**
     * Envía el prompt con contexto al modelo y transmite la respuesta por partes (streaming).
     *
     * @param prompt Objeto de prompt estructurado.
     * @param chunkConsumer Callback que procesa cada fragmento de la respuesta conforme llega.
     */
    void generateResponseStream(LlmPrompt prompt, java.util.function.Consumer<LlmStreamingChunk> chunkConsumer);
}
