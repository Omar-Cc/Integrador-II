package com.integrador.marweld.chatbot.infrastructure.persistence.repository;

import com.integrador.marweld.chatbot.domain.model.MensajeChatbot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repositorio JPA para acceder a los datos de la entidad MensajeChatbot.
 */
@Repository
public interface MensajeChatbotRepository extends JpaRepository<MensajeChatbot, Integer> {

    /**
     * Recupera el historial de mensajes asociados a una sesión de chatbot en orden cronológico.
     *
     * @param idSesionChatbot ID de la sesión.
     * @return Lista de mensajes ordenados por fecha.
     */
    List<MensajeChatbot> findBySesionChatbotIdSesionChatbotOrderByFechaMensajeAsc(Integer idSesionChatbot);

    /**
     * Recupera los últimos 10 mensajes de una sesión de chatbot, ordenados de forma descendente por fecha.
     *
     * @param idSesionChatbot ID de la sesión.
     * @return Lista de los últimos 10 mensajes.
     */
    List<MensajeChatbot> findTop10BySesionChatbotIdSesionChatbotOrderByFechaMensajeDesc(Integer idSesionChatbot);
}
