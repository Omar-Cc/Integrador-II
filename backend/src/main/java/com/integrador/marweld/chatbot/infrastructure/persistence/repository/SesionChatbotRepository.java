package com.integrador.marweld.chatbot.infrastructure.persistence.repository;

import com.integrador.marweld.chatbot.domain.model.SesionChatbot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * Repositorio JPA para acceder a los datos de la entidad SesionChatbot.
 */
@Repository
public interface SesionChatbotRepository extends JpaRepository<SesionChatbot, Integer> {

    /**
     * Busca una sesión por su identificador público UUID.
     *
     * @param publicId Identificador UUID público.
     * @return Sesión encontrada o vacío.
     */
    Optional<SesionChatbot> findByPublicId(UUID publicId);
}
