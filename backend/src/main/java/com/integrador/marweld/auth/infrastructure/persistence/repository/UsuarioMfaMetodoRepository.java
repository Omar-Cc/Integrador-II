package com.integrador.marweld.auth.infrastructure.persistence.repository;

import com.integrador.marweld.auth.domain.model.EstadoMfaMetodo;
import com.integrador.marweld.auth.domain.model.MetodoMfa;
import com.integrador.marweld.auth.domain.model.Usuario;
import com.integrador.marweld.auth.domain.model.UsuarioMfaMetodo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UsuarioMfaMetodoRepository extends JpaRepository<UsuarioMfaMetodo, Integer> {
    Optional<UsuarioMfaMetodo> findByUsuarioAndMetodo(Usuario usuario, MetodoMfa metodo);

    boolean existsByUsuarioAndMetodoAndEstado(Usuario usuario, MetodoMfa metodo, EstadoMfaMetodo estado);

    List<UsuarioMfaMetodo> findByUsuario(Usuario usuario);
}
