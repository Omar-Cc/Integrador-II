package com.integrador.marweld.auth.infrastructure.persistence.repository;

import com.integrador.marweld.auth.domain.model.UsuarioMfaMetodo;
import com.integrador.marweld.auth.domain.model.UsuarioMfaTotp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UsuarioMfaTotpRepository extends JpaRepository<UsuarioMfaTotp, Integer> {
    Optional<UsuarioMfaTotp> findByMetodo(UsuarioMfaMetodo metodo);
}
