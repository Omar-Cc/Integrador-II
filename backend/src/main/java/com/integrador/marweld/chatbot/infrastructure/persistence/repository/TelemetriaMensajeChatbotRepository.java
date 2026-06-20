package com.integrador.marweld.chatbot.infrastructure.persistence.repository;

import com.integrador.marweld.chatbot.domain.model.TelemetriaMensajeChatbot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repositorio JPA para acceder a los datos de la entidad TelemetriaMensajeChatbot.
 */
@Repository
public interface TelemetriaMensajeChatbotRepository extends JpaRepository<TelemetriaMensajeChatbot, Integer> {
}
