package com.integrador.marweld.auth.infrastructure.persistence.repository;

import com.integrador.marweld.auth.domain.model.SesionUsuario;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SesionUsuarioRepository extends JpaRepository<SesionUsuario, Integer> {}
