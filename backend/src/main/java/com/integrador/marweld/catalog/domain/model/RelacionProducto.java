package com.integrador.marweld.catalog.domain.model;

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
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Entidad de dominio que representa una relación de compatibilidad o venta cruzada entre productos.
 */
@Entity
@Table(name = "relaciones_producto")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RelacionProducto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_relacion")
    private Integer idRelacion;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_producto_origen", nullable = false)
    private Producto productoOrigen;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_producto_destino", nullable = false)
    private Producto productoDestino;

    @Column(name = "tipo_relacion", nullable = false, length = 50)
    @Enumerated(EnumType.STRING)
    private TipoRelacionProducto tipoRelacion;
}
