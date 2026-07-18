package com.integrador.marweld.auth.infrastructure.persistence.repository;

import com.integrador.marweld.auth.domain.model.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;
import com.integrador.marweld.auth.domain.model.Usuario;

@Repository
public interface ClienteRepository extends JpaRepository<Cliente, Integer> {
    boolean existsByDocumento(String documento);
    Optional<Cliente> findByUsuario(Usuario usuario);
    Optional<Cliente> findByPublicId(UUID publicId);
}
