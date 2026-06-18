package com.integrador.marweld.chatbot.infrastructure.persistence.repository;

import com.integrador.marweld.chatbot.domain.model.ErrorChatbot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repositorio JPA para acceder a los datos de la entidad ErrorChatbot.
 */
@Repository
public interface ErrorChatbotRepository extends JpaRepository<ErrorChatbot, Integer> {

    /**
     * Obtiene los errores de chatbot asociados a un mensaje específico.
     *
     * @param idMensajeChatbot ID del mensaje.
     * @return Lista de errores.
     */
    List<ErrorChatbot> findByMensajeChatbotIdMensajeChatbot(Integer idMensajeChatbot);
}
