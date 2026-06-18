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
import java.time.LocalDateTime;

@Entity
@Table(name = "codigos_verificacion")
public class CodigoVerificacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_codigo_verificacion")
    private Integer idCodigoVerificacion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @Column(name = "codigo", nullable = false, length = 6)
    private String codigo;

    @Column(name = "fecha_expiracion", nullable = false)
    private LocalDateTime fechaExpiracion;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false, length = 30)
    private EstadoCodigo estado = EstadoCodigo.PENDIENTE;

    public CodigoVerificacion() {}

    public CodigoVerificacion(Usuario usuario, String codigo, LocalDateTime fechaExpiracion, EstadoCodigo estado) {
        this.usuario = usuario;
        this.codigo = codigo;
        this.fechaExpiracion = fechaExpiracion;
        this.estado = estado;
    }

    public Integer getIdCodigoVerificacion() {
        return idCodigoVerificacion;
    }

    public void setIdCodigoVerificacion(Integer idCodigoVerificacion) {
        this.idCodigoVerificacion = idCodigoVerificacion;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public String getCodigo() {
        return codigo;
    }

    public void setCodigo(String codigo) {
        this.codigo = codigo;
    }

    public LocalDateTime getFechaExpiracion() {
        return fechaExpiracion;
    }

    public void setFechaExpiracion(LocalDateTime fechaExpiracion) {
        this.fechaExpiracion = fechaExpiracion;
    }

    public EstadoCodigo getEstado() {
        return estado;
    }

    public void setEstado(EstadoCodigo estado) {
        this.estado = estado;
    }
}
