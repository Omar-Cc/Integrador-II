package com.integrador.marweld.cart.infrastructure.persistence.repository;

import com.integrador.marweld.cart.domain.model.Carrito;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repositorio JPA para carritos.
 */
@Repository
public interface CarritoRepository extends JpaRepository<Carrito, Integer> {

    Optional<Carrito> findFirstByIdClienteAndEstadoCarritoCodigoOrderByFechaCreacionDesc(Integer idCliente, String codigo);

    Optional<Carrito> findFirstByTokenVisitanteAndEstadoCarritoCodigoOrderByFechaCreacionDesc(String tokenVisitante, String codigo);
}