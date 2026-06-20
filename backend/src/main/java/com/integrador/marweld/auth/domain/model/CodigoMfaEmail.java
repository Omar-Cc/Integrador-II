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
@Table(name = "codigos_mfa_email")
public class CodigoMfaEmail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_codigo_mfa_email")
    private Integer idCodigoMfaEmail;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_desafio_mfa")
    private DesafioMfa desafio;

    @Column(name = "codigo_hash", nullable = false)
    private String codigoHash;

    @Enumerated(EnumType.STRING)
    @Column(name = "proposito", nullable = false, length = 30)
    private PropositoCodigoMfa proposito;

    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion = LocalDateTime.now();

    @Column(name = "fecha_expiracion", nullable = false)
    private LocalDateTime fechaExpiracion;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false, length = 30)
    private EstadoCodigoMfa estado = EstadoCodigoMfa.PENDIENTE;

    public CodigoMfaEmail() {}

    public CodigoMfaEmail(Usuario usuario, String codigoHash, PropositoCodigoMfa proposito, LocalDateTime fechaExpiracion) {
        this.usuario = usuario;
        this.codigoHash = codigoHash;
        this.proposito = proposito;
        this.fechaExpiracion = fechaExpiracion;
    }

    public CodigoMfaEmail(Usuario usuario, DesafioMfa desafio, String codigoHash,
                          PropositoCodigoMfa proposito, LocalDateTime fechaExpiracion) {
        this(usuario, codigoHash, proposito, fechaExpiracion);
        this.desafio = desafio;
    }

    public boolean estaExpirado(LocalDateTime ahora) {
        return fechaExpiracion.isBefore(ahora);
    }

    public void utilizar() {
        this.estado = EstadoCodigoMfa.UTILIZADO;
    }

    public void expirar() {
        this.estado = EstadoCodigoMfa.EXPIRADO;
    }

    public String getCodigoHash() {
        return codigoHash;
    }

    public LocalDateTime getFechaExpiracion() {
        return fechaExpiracion;
    }

    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }
}
