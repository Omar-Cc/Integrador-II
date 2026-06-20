package com.integrador.marweld.catalog.infrastructure.persistence.repository;

import com.integrador.marweld.catalog.domain.model.TipoProducto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repositorio JPA para acceder a los datos de la entidad TipoProducto.
 */
@Repository
public interface TipoProductoRepository extends JpaRepository<TipoProducto, Integer> {

    /**
     * Busca un tipo de producto por su código único.
     *
     * @param codigo Código identificador (ej. 'EQUIPO', 'CONSUMIBLE').
     * @return Tipo de producto encontrado o vacío.
     */
    Optional<TipoProducto> findByCodigo(String codigo);
}
