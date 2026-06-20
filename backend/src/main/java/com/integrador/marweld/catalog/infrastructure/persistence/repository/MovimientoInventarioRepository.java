package com.integrador.marweld.catalog.infrastructure.persistence.repository;

import com.integrador.marweld.catalog.domain.model.MovimientoInventario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repositorio JPA para acceder a los datos de la entidad MovimientoInventario.
 */
@Repository
public interface MovimientoInventarioRepository extends JpaRepository<MovimientoInventario, Integer> {

    /**
     * Recupera el historial de movimientos de inventario asociados a un producto.
     *
     * @param idProducto ID del producto.
     * @return Lista de movimientos.
     */
    List<MovimientoInventario> findByProductoIdProductoOrderByFechaMovimientoDesc(Integer idProducto);
}
