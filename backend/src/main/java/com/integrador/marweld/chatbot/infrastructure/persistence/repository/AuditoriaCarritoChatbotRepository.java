package com.integrador.marweld.chatbot.infrastructure.persistence.repository;

import com.integrador.marweld.chatbot.domain.model.AuditoriaCarritoChatbot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repositorio JPA para acceder a los datos de la entidad AuditoriaCarritoChatbot.
 */
@Repository
public interface AuditoriaCarritoChatbotRepository extends JpaRepository<AuditoriaCarritoChatbot, Integer> {

    /**
     * Obtiene todo el historial de auditoría de operaciones realizadas sobre un carrito específico.
     *
     * @param idCarrito ID del carrito de compras.
     * @return Lista de registros de auditoría.
     */
    List<AuditoriaCarritoChatbot> findByIdCarrito(Integer idCarrito);
}
