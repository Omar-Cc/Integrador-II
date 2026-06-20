package com.integrador.marweld.catalog.infrastructure.persistence.repository;

import com.integrador.marweld.catalog.domain.model.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repositorio JPA para acceder a los datos de la entidad Categoria.
 */
@Repository
public interface CategoriaRepository extends JpaRepository<Categoria, Integer> {

    /**
     * Obtiene una lista de categorías filtradas por su estado.
     *
     * @param estado Estado de la categoría.
     * @return Lista de categorías.
     */
    java.util.List<Categoria> findByEstado(String estado);
}
