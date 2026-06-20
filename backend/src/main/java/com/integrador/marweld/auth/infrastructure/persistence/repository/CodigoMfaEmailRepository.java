package com.integrador.marweld.auth.infrastructure.persistence.repository;

import com.integrador.marweld.auth.domain.model.CodigoMfaEmail;
import com.integrador.marweld.auth.domain.model.EstadoCodigoMfa;
import com.integrador.marweld.auth.domain.model.PropositoCodigoMfa;
import com.integrador.marweld.auth.domain.model.Usuario;
import com.integrador.marweld.auth.domain.model.DesafioMfa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
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

    List<CodigoMfaEmail> findByDesafioAndEstado(DesafioMfa desafio, EstadoCodigoMfa estado);

    Optional<CodigoMfaEmail> findFirstByDesafioAndEstadoOrderByFechaExpiracionDesc(
            DesafioMfa desafio, EstadoCodigoMfa estado);

    long countByUsuarioAndFechaCreacionAfter(Usuario usuario, LocalDateTime time);

    Optional<CodigoMfaEmail> findFirstByUsuarioOrderByFechaCreacionDesc(Usuario usuario);
}
