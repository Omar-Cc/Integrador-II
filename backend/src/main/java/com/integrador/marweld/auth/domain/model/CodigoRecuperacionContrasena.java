package com.integrador.marweld.auth.domain.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "codigos_recuperacion_contrasena")
public class CodigoRecuperacionContrasena {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_codigo_recuperacion")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @Column(name = "codigo_hash", nullable = false)
    private String codigoHash;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false, length = 30)
    private EstadoCodigoRecuperacion estado = EstadoCodigoRecuperacion.PENDIENTE;

    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion = LocalDateTime.now();

    @Column(name = "fecha_expiracion", nullable = false)
    private LocalDateTime fechaExpiracion;

    @Column(name = "fecha_uso")
    private LocalDateTime fechaUso;

    protected CodigoRecuperacionContrasena() { }

    public CodigoRecuperacionContrasena(Usuario usuario, String codigoHash, LocalDateTime fechaExpiracion) {
        this.usuario = usuario;
        this.codigoHash = codigoHash;
        this.fechaExpiracion = fechaExpiracion;
    }

    public boolean estaExpirado(LocalDateTime ahora) { return fechaExpiracion.isBefore(ahora); }
    public void expirar() { estado = EstadoCodigoRecuperacion.EXPIRADO; }
    public void utilizar() { estado = EstadoCodigoRecuperacion.UTILIZADO; fechaUso = LocalDateTime.now(); }
    public String getCodigoHash() { return codigoHash; }
    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
}
