package com.integrador.marweld.catalog.infrastructure.persistence.repository;

import com.integrador.marweld.catalog.domain.model.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * Repositorio JPA para acceder a los datos de la entidad Producto.
 */
@Repository
public interface ProductoRepository extends JpaRepository<Producto, Integer> {

    /**
     * Busca un producto por su identificador público UUID.
     *
     * @param publicId Identificador UUID público.
     * @return Producto encontrado o vacío.
     */
    Optional<Producto> findByPublicId(UUID publicId);

    /**
     * Obtiene una lista de productos filtrados por su estado.
     *
     * @param estado Estado del producto.
     * @return Lista de productos.
     */
    java.util.List<Producto> findByEstado(String estado);

    /**
     * Busca productos activos por nombre o coincidencia parcial de texto.
     *
     * @param nombre Fragmento del nombre del producto.
     * @param estado Estado del producto (ej. 'ACTIVO').
     * @return Lista de productos encontrados.
     */
    java.util.List<Producto> findByNombreContainingIgnoreCaseAndEstado(String nombre, String estado);
}
