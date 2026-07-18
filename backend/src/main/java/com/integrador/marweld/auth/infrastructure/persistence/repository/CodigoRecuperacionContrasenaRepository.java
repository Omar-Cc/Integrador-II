package com.integrador.marweld.auth.infrastructure.persistence.repository;

import com.integrador.marweld.auth.domain.model.CodigoRecuperacionContrasena;
import com.integrador.marweld.auth.domain.model.EstadoCodigoRecuperacion;
import com.integrador.marweld.auth.domain.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface CodigoRecuperacionContrasenaRepository extends JpaRepository<CodigoRecuperacionContrasena, Integer> {
    List<CodigoRecuperacionContrasena> findByUsuarioAndEstado(Usuario usuario, EstadoCodigoRecuperacion estado);
    Optional<CodigoRecuperacionContrasena> findFirstByUsuarioAndEstadoOrderByFechaCreacionDesc(Usuario usuario, EstadoCodigoRecuperacion estado);
    Optional<CodigoRecuperacionContrasena> findFirstByUsuarioOrderByFechaCreacionDesc(Usuario usuario);
    long countByUsuarioAndFechaCreacionAfter(Usuario usuario, LocalDateTime fecha);
}
