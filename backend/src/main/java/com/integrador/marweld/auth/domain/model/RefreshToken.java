package com.integrador.marweld.auth.domain.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "refresh_tokens")
public class RefreshToken {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_refresh_token")
    private Integer idRefreshToken;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_sesion_usuario", nullable = false)
    private SesionUsuario sesion;

    @Column(name = "token_hash", nullable = false, unique = true, length = 255)
    private String tokenHash;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false, length = 30)
    private EstadoRefreshToken estado = EstadoRefreshToken.ACTIVO;

    @Column(name = "fecha_emision", nullable = false, updatable = false)
    private LocalDateTime fechaEmision = LocalDateTime.now();

    @Column(name = "fecha_expiracion", nullable = false)
    private LocalDateTime fechaExpiracion;

    @Column(name = "fecha_revocacion")
    private LocalDateTime fechaRevocacion;

    protected RefreshToken() {}

    public RefreshToken(SesionUsuario sesion, String tokenHash, LocalDateTime fechaExpiracion) {
        this.sesion = sesion;
        this.tokenHash = tokenHash;
        this.fechaExpiracion = fechaExpiracion;
    }

    public boolean estaVigente(LocalDateTime ahora) {
        return estado == EstadoRefreshToken.ACTIVO && fechaExpiracion.isAfter(ahora)
                && sesion.getEstado() == EstadoSesionUsuario.ACTIVA;
    }

    public void revocar() { this.estado = EstadoRefreshToken.REVOCADO; this.fechaRevocacion = LocalDateTime.now(); }
    public void expirar() { this.estado = EstadoRefreshToken.EXPIRADO; }
    public SesionUsuario getSesion() { return sesion; }
}
