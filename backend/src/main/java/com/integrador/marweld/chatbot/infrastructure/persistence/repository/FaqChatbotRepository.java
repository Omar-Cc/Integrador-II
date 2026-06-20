package com.integrador.marweld.chatbot.infrastructure.persistence.repository;

import com.integrador.marweld.chatbot.domain.model.FaqChatbot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
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

    /**
     * Realiza una búsqueda semántica de vecinos más cercanos usando distancia de coseno.
     *
     * @param embeddingVectorString Representación del vector como string (ej. "[0.123, -0.456, ...]").
     * @param limit Cantidad máxima de registros a retornar.
     * @return Lista de FAQs ordenadas por relevancia semántica.
     */
    @Query(value = "SELECT * FROM faq_chatbot f WHERE f.estado = 'ACTIVO' ORDER BY f.embedding <=> cast(?1 as vector) LIMIT ?2", nativeQuery = true)
    List<FaqChatbot> findNearestFaqs(String embeddingVectorString, int limit);
}
