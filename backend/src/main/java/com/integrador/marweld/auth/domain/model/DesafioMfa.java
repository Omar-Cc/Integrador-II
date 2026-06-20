package com.integrador.marweld.auth.domain.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "desafios_mfa")
public class DesafioMfa {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_desafio_mfa")
    private Integer idDesafioMfa;

    @Column(name = "public_id", nullable = false, unique = true)
    private UUID publicId = UUID.randomUUID();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false, length = 30)
    private EstadoDesafioMfa estado = EstadoDesafioMfa.PENDIENTE;

    @Column(name = "intentos_fallidos", nullable = false)
    private int intentosFallidos;

    @Column(name = "max_intentos", nullable = false)
    private int maxIntentos = 5;

    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion = LocalDateTime.now();

    @Column(name = "fecha_expiracion", nullable = false)
    private LocalDateTime fechaExpiracion;

    @Column(name = "fecha_consumo")
    private LocalDateTime fechaConsumo;

    protected DesafioMfa() {}

    public DesafioMfa(Usuario usuario, LocalDateTime fechaExpiracion) {
        this.usuario = usuario;
        this.fechaExpiracion = fechaExpiracion;
    }

    public boolean disponible(LocalDateTime ahora) {
        if (estado != EstadoDesafioMfa.PENDIENTE) return false;
        if (!fechaExpiracion.isAfter(ahora)) { estado = EstadoDesafioMfa.EXPIRADO; return false; }
        return true;
    }

    public void registrarFallo() {
        intentosFallidos++;
        if (intentosFallidos >= maxIntentos) estado = EstadoDesafioMfa.BLOQUEADO;
    }

    public void consumir() { estado = EstadoDesafioMfa.CONSUMIDO; fechaConsumo = LocalDateTime.now(); }
    public Integer getIdDesafioMfa() { return idDesafioMfa; }
    public UUID getPublicId() { return publicId; }
    public Usuario getUsuario() { return usuario; }
    public LocalDateTime getFechaExpiracion() { return fechaExpiracion; }
    public EstadoDesafioMfa getEstado() { return estado; }
}
