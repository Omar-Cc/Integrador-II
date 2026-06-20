package com.integrador.marweld.catalog.infrastructure.persistence.repository;

import com.integrador.marweld.catalog.domain.model.Inventario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repositorio JPA para acceder a los datos de la entidad Inventario.
 */
@Repository
public interface InventarioRepository extends JpaRepository<Inventario, Integer> {

    /**
     * Busca el registro de inventario asociado a un producto por su id de producto.
     *
     * @param idProducto ID del producto.
     * @return Inventario asociado o vacío.
     */
    Optional<Inventario> findByProductoIdProducto(Integer idProducto);
}
