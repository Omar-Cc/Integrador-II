package com.integrador.marweld.chatbot.application.usecase;

import com.integrador.marweld.chatbot.application.command.ProcessMessageCommand;
import com.integrador.marweld.chatbot.application.result.MessageProcessResult;
import com.integrador.marweld.chatbot.application.port.LlmStreamingChunk;

/**
 * Caso de uso principal para procesar y responder un mensaje del usuario en el chatbot.
 */
public interface ProcessMessageUseCase {

    /**
     * Procesa la entrada del usuario, invoca al LLM con el contexto de catálogo/FAQ y persiste el resultado.
     *
     * @param command Command con el mensaje e identificador de sesión.
     * @return Resultado del procesamiento.
     */
    MessageProcessResult handle(ProcessMessageCommand command);

    /**
     * Procesa la entrada del usuario y transmite la respuesta en tiempo real (streaming).
     *
     * @param command Command con el mensaje e identificador de sesión.
     * @param chunkConsumer Callback que recibe cada fragmento de la respuesta conforme llega.
     */
    void handleStream(ProcessMessageCommand command, java.util.function.Consumer<LlmStreamingChunk> chunkConsumer);
}
