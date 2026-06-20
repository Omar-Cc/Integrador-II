package com.integrador.marweld.auth.domain.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "usuarios_mfa_metodos",
        uniqueConstraints = @UniqueConstraint(name = "uq_usuarios_mfa_metodos_usuario_metodo", columnNames = {"id_usuario", "metodo"})
)
public class UsuarioMfaMetodo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_usuario_mfa_metodo")
    private Integer idUsuarioMfaMetodo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @Enumerated(EnumType.STRING)
    @Column(name = "metodo", nullable = false, length = 30)
    private MetodoMfa metodo;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false, length = 30)
    private EstadoMfaMetodo estado = EstadoMfaMetodo.PENDIENTE;

    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion = LocalDateTime.now();

    @Column(name = "fecha_activacion")
    private LocalDateTime fechaActivacion;

    @Column(name = "fecha_desactivacion")
    private LocalDateTime fechaDesactivacion;

    public UsuarioMfaMetodo() {}

    public UsuarioMfaMetodo(Usuario usuario, MetodoMfa metodo, EstadoMfaMetodo estado) {
        this.usuario = usuario;
        this.metodo = metodo;
        this.estado = estado;
    }

    public void activar() {
        this.estado = EstadoMfaMetodo.ACTIVO;
        this.fechaActivacion = LocalDateTime.now();
        this.fechaDesactivacion = null;
    }

    public void dejarPendiente() {
        this.estado = EstadoMfaMetodo.PENDIENTE;
        this.fechaActivacion = null;
        this.fechaDesactivacion = null;
    }

    public Integer getIdUsuarioMfaMetodo() {
        return idUsuarioMfaMetodo;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public MetodoMfa getMetodo() {
        return metodo;
    }

    public void setMetodo(MetodoMfa metodo) {
        this.metodo = metodo;
    }

    public EstadoMfaMetodo getEstado() {
        return estado;
    }

    public void setEstado(EstadoMfaMetodo estado) {
        this.estado = estado;
    }
}
