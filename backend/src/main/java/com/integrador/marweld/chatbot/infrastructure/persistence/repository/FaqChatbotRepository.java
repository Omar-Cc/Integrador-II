package com.integrador.marweld.chatbot.infrastructure.persistence.repository;

import com.integrador.marweld.chatbot.domain.model.FaqChatbot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repositorio JPA para acceder a los datos de la entidad FaqChatbot.
 */
@Repository
public interface FaqChatbotRepository extends JpaRepository<FaqChatbot, Integer> {

    /**
     * Recupera las FAQs que estén en un estado específico (ej. 'ACTIVO').
     *
     * @param estado Estado de las FAQs.
     * @return Lista de FAQs encontradas.
     */
    List<FaqChatbot> findByEstado(String estado);
}
