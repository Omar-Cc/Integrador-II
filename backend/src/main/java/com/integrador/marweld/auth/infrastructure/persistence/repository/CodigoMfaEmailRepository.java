package com.integrador.marweld.auth.infrastructure.persistence.repository;

import com.integrador.marweld.auth.domain.model.CodigoMfaEmail;
import com.integrador.marweld.auth.domain.model.EstadoCodigoMfa;
import com.integrador.marweld.auth.domain.model.PropositoCodigoMfa;
import com.integrador.marweld.auth.domain.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CodigoMfaEmailRepository extends JpaRepository<CodigoMfaEmail, Integer> {
    List<CodigoMfaEmail> findByUsuarioAndPropositoAndEstado(Usuario usuario, PropositoCodigoMfa proposito, EstadoCodigoMfa estado);

    Optional<CodigoMfaEmail> findFirstByUsuarioAndPropositoAndEstadoOrderByFechaExpiracionDesc(
            Usuario usuario,
            PropositoCodigoMfa proposito,
            EstadoCodigoMfa estado
    );
}
