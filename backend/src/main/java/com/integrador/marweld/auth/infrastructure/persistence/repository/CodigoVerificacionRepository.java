package com.integrador.marweld.auth.infrastructure.persistence.repository;

import com.integrador.marweld.auth.domain.model.CodigoVerificacion;
import com.integrador.marweld.auth.domain.model.EstadoCodigo;
import com.integrador.marweld.auth.domain.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CodigoVerificacionRepository extends JpaRepository<CodigoVerificacion, Integer> {
    Optional<CodigoVerificacion> findFirstByUsuarioAndCodigoAndEstadoOrderByFechaExpiracionDesc(
            Usuario usuario,
            String codigo,
            EstadoCodigo estado
    );

    List<CodigoVerificacion> findByUsuarioAndEstado(Usuario usuario, EstadoCodigo estado);
}
