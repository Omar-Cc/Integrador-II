package com.integrador.marweld.cart.infrastructure.persistence.repository;

import com.integrador.marweld.cart.domain.model.EstadoCarrito;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repositorio JPA para estados de carrito.
 */
@Repository
public interface EstadoCarritoRepository extends JpaRepository<EstadoCarrito, Integer> {

    Optional<EstadoCarrito> findByCodigo(String codigo);
}