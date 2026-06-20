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
 * Entidad de dominio que representa una transacción de movimiento en el inventario.
 */
@Entity
@Table(name = "movimientos_inventario")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MovimientoInventario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_movimiento")
    private Integer idMovimiento;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_producto", nullable = false)
    private Producto producto;

    /**
     * ID de usuario que registra el movimiento. 
     * Se mantiene plano para evitar el acoplamiento duro entre módulos en JPA.
     */
    @Column(name = "id_usuario", nullable = false)
    private Integer idUsuario;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_tipo_movimiento", nullable = false)
    private TipoMovimiento tipoMovimiento;

    @Column(name = "cantidad", nullable = false)
    private Integer cantidad;

    @Column(name = "motivo", columnDefinition = "TEXT")
    private String motivo;

    @Column(name = "fecha_movimiento", nullable = false)
    @Builder.Default
    private LocalDateTime fechaMovimiento = LocalDateTime.now();
}
