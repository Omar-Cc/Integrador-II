package com.integrador.marweld.cart.infrastructure.persistence.repository;

import com.integrador.marweld.cart.domain.model.DetalleCarrito;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repositorio JPA para detalles de carrito.
 */
@Repository
public interface DetalleCarritoRepository extends JpaRepository<DetalleCarrito, Integer> {

    List<DetalleCarrito> findByCarritoIdCarrito(Integer idCarrito);

    Optional<DetalleCarrito> findByCarritoIdCarritoAndIdProducto(Integer idCarrito, Integer idProducto);

    void deleteByCarritoIdCarritoAndIdProducto(Integer idCarrito, Integer idProducto);
}