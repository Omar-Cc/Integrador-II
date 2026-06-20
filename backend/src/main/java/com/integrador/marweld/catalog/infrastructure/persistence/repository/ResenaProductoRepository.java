package com.integrador.marweld.catalog.infrastructure.persistence.repository;

import com.integrador.marweld.catalog.domain.model.ResenaProducto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repositorio JPA para acceder a los datos de la entidad ResenaProducto.
 */
@Repository
public interface ResenaProductoRepository extends JpaRepository<ResenaProducto, Integer> {

    /**
     * Recupera las reseñas aprobadas de un producto específico.
     *
     * @param idProducto ID del producto.
     * @param aprobada   Estado de aprobación (generalmente true para listados públicos).
     * @return Lista de reseñas de producto.
     */
    List<ResenaProducto> findByProductoIdProductoAndAprobadaOrderByFechaCreacionDesc(Integer idProducto, Boolean aprobada);
}
