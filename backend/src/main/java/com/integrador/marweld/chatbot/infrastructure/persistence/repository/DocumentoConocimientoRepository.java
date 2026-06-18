package com.integrador.marweld.chatbot.infrastructure.persistence.repository;

import com.integrador.marweld.chatbot.domain.model.DocumentoConocimiento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repositorio JPA para acceder a los datos de la entidad DocumentoConocimiento.
 */
@Repository
public interface DocumentoConocimientoRepository extends JpaRepository<DocumentoConocimiento, Integer> {

    /**
     * Busca un documento de conocimiento por su public_id.
     *
     * @param publicId Identificador UUID público.
     * @return Documento encontrado o vacío.
     */
    Optional<DocumentoConocimiento> findByPublicId(UUID publicId);

    /**
     * Obtiene los documentos activos de una categoría específica.
     *
     * @param estado Estado del documento (ej. 'ACTIVO').
     * @param categoria Categoría del documento.
     * @return Lista de documentos.
     */
    List<DocumentoConocimiento> findByEstadoAndCategoria(String estado, String categoria);
}
