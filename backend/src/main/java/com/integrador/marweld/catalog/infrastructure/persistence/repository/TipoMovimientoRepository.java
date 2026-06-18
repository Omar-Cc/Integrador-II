package com.integrador.marweld.catalog.infrastructure.persistence.repository;

import com.integrador.marweld.catalog.domain.model.TipoMovimiento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repositorio JPA para acceder a los datos de la entidad TipoMovimiento.
 */
@Repository
public interface TipoMovimientoRepository extends JpaRepository<TipoMovimiento, Integer> {

    /**
     * Busca un tipo de movimiento por su código textual estable (ej. 'EGRESO_VENTA').
     *
     * @param codigo Código del tipo de movimiento.
     * @return Tipo de movimiento encontrado o vacío.
     */
    Optional<TipoMovimiento> findByCodigo(String codigo);
}
