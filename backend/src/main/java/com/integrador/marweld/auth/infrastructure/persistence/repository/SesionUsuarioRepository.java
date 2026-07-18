package com.integrador.marweld.auth.infrastructure.persistence.repository;

import com.integrador.marweld.auth.domain.model.SesionUsuario;
import com.integrador.marweld.auth.domain.model.EstadoSesionUsuario;
import com.integrador.marweld.auth.domain.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SesionUsuarioRepository extends JpaRepository<SesionUsuario, Integer> {
    List<SesionUsuario> findByUsuarioAndEstado(Usuario usuario, EstadoSesionUsuario estado);
}
