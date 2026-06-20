package com.integrador.marweld.auth.domain.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "usuarios_mfa_totp")
public class UsuarioMfaTotp {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_usuario_mfa_totp")
    private Integer idUsuarioMfaTotp;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario_mfa_metodo", nullable = false, unique = true)
    private UsuarioMfaMetodo metodo;

    @Column(name = "secreto_cifrado", nullable = false, columnDefinition = "TEXT")
    private String secretoCifrado;

    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion = LocalDateTime.now();

    @Column(name = "fecha_actualizacion", nullable = false)
    private LocalDateTime fechaActualizacion = LocalDateTime.now();

    public UsuarioMfaTotp() {}

    public UsuarioMfaTotp(UsuarioMfaMetodo metodo, String secretoCifrado) {
        this.metodo = metodo;
        this.secretoCifrado = secretoCifrado;
    }

    public void actualizarSecreto(String secretoCifrado) {
        this.secretoCifrado = secretoCifrado;
        this.fechaActualizacion = LocalDateTime.now();
    }

    public String getSecretoCifrado() {
        return secretoCifrado;
    }

    public UsuarioMfaMetodo getMetodo() {
        return metodo;
    }

    public void setMetodo(UsuarioMfaMetodo metodo) {
        this.metodo = metodo;
    }
}
