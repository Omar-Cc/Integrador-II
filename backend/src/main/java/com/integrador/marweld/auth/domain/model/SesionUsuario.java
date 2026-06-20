package com.integrador.marweld.auth.domain.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "sesiones_usuario")
public class SesionUsuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_sesion_usuario")
    private Integer idSesionUsuario;

    @Column(name = "public_id", nullable = false, unique = true)
    private UUID publicId = UUID.randomUUID();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false, length = 30)
    private EstadoSesionUsuario estado = EstadoSesionUsuario.ACTIVA;

    @Column(name = "ip", length = 45)
    private String ip;

    @Column(name = "user_agent", columnDefinition = "TEXT")
    private String userAgent;

    @Column(name = "fecha_inicio", nullable = false, updatable = false)
    private LocalDateTime fechaInicio = LocalDateTime.now();

    @Column(name = "fecha_ultimo_uso", nullable = false)
    private LocalDateTime fechaUltimoUso = LocalDateTime.now();

    @Column(name = "fecha_cierre")
    private LocalDateTime fechaCierre;

    protected SesionUsuario() {}

    public SesionUsuario(Usuario usuario, String ip, String userAgent) {
        this.usuario = usuario;
        this.ip = ip;
        this.userAgent = userAgent;
    }

    public void registrarUso() { this.fechaUltimoUso = LocalDateTime.now(); }
    public void cerrar() { this.estado = EstadoSesionUsuario.CERRADA; this.fechaCierre = LocalDateTime.now(); }
    public Integer getIdSesionUsuario() { return idSesionUsuario; }
    public UUID getPublicId() { return publicId; }
    public Usuario getUsuario() { return usuario; }
    public EstadoSesionUsuario getEstado() { return estado; }
}
