package com.integrador.marweld.auth.infrastructure.persistence.repository;

import com.integrador.marweld.auth.domain.model.DesafioMfa;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import java.util.Optional;
import java.util.UUID;

public interface DesafioMfaRepository extends JpaRepository<DesafioMfa, Integer> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<DesafioMfa> findByPublicId(UUID publicId);
}
