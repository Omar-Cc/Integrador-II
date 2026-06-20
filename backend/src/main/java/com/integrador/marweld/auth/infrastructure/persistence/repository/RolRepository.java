package com.integrador.marweld.auth.infrastructure.persistence.repository;

import com.integrador.marweld.auth.domain.model.Rol;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RolRepository extends JpaRepository<Rol, Integer> {
    Optional<Rol> findByNombreRol(String nombreRol);
}
