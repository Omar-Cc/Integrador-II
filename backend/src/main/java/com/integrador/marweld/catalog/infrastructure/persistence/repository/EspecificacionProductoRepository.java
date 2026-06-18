package com.integrador.marweld.catalog.infrastructure.persistence.repository;

import com.integrador.marweld.catalog.domain.model.EspecificacionProducto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repositorio JPA para acceder a los datos de la entidad EspecificacionProducto.
 */
@Repository
public interface EspecificacionProductoRepository extends JpaRepository<EspecificacionProducto, Integer> {

    /**
     * Obtiene la lista de especificaciones asociadas a un producto específico.
     *
     * @param idProducto ID interno del producto.
     * @return Lista de especificaciones técnicas.
     */
    List<EspecificacionProducto> findByProductoIdProducto(Integer idProducto);
}
