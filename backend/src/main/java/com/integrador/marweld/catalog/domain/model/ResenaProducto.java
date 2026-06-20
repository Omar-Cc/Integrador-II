package com.integrador.marweld.catalog.domain.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Entidad de dominio que representa una reseña o valoración de producto por parte de un cliente.
 */
@Entity
@Table(name = "resenas_producto")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResenaProducto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_resena")
    private Integer idResena;

    /**
     * ID del cliente que realiza la reseña.
     * Mapeado plano para evitar acoplamiento con la entidad Cliente/Usuario del otro módulo.
     */
    @Column(name = "id_cliente", nullable = false)
    private Integer idCliente;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_producto", nullable = false)
    private Producto producto;

    @Column(name = "calificacion", nullable = false)
    private Integer calificacion;

    @Column(name = "comentario", columnDefinition = "TEXT")
    private String comentario;

    @Column(name = "aprobada", nullable = false)
    @Builder.Default
    private Boolean aprobada = false;

    @Column(name = "fecha_creacion", nullable = false)
    @Builder.Default
    private LocalDateTime fechaCreacion = LocalDateTime.now();
}
