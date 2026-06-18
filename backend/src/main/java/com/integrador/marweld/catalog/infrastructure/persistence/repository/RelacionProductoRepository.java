package com.integrador.marweld.catalog.infrastructure.persistence.repository;

import com.integrador.marweld.catalog.domain.model.RelacionProducto;
import com.integrador.marweld.catalog.domain.model.TipoRelacionProducto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repositorio JPA para acceder a los datos de la entidad RelacionProducto.
 */
@Repository
public interface RelacionProductoRepository extends JpaRepository<RelacionProducto, Integer> {

    /**
     * Busca todas las relaciones de productos originadas desde un producto origen.
     *
     * @param idProductoOrigen ID interno del producto origen.
     * @return Lista de relaciones encontradas.
     */
    List<RelacionProducto> findByProductoOrigenIdProducto(Integer idProductoOrigen);

    /**
     * Busca relaciones de productos originadas desde un producto origen filtrando por tipo de relación.
     *
     * @param idProductoOrigen ID interno del producto origen.
     * @param tipoRelacion Tipo de relación de catálogo.
     * @return Lista de relaciones filtradas.
     */
    List<RelacionProducto> findByProductoOrigenIdProductoAndTipoRelacion(Integer idProductoOrigen, TipoRelacionProducto tipoRelacion);

    /**
     * Busca relaciones que tienen como destino un producto específico (ej. encontrar consumibles compatibles con una máquina).
     *
     * @param idProductoDestino ID interno de la máquina o producto principal.
     * @param tipoRelacion Tipo de relación de catálogo.
     * @return Lista de relaciones coincidentes.
     */
    List<RelacionProducto> findByProductoDestinoIdProductoAndTipoRelacion(Integer idProductoDestino, TipoRelacionProducto tipoRelacion);
}
