package com.integrador.marweld.chatbot.domain.model;

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

import java.time.LocalDateTime;

/**
 * Entidad de dominio que audita y registra los cambios en carritos de compras ejecutados a través del chatbot.
 */
@Entity
@Table(name = "auditoria_carrito_chatbot")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditoriaCarritoChatbot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_auditoria_carrito")
    private Integer idAuditoriaCarrito;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_mensaje_chatbot", nullable = false)
    private MensajeChatbot mensajeChatbot;

    /**
     * ID de carrito modificado.
     * Mapeado plano para evitar acoplamiento con el módulo de carritos.
     */
    @Column(name = "id_carrito", nullable = false)
    private Integer idCarrito;

    /**
     * ID del producto involucrado en la operación.
     * Mapeado plano para evitar acoplamiento con el módulo de catálogo.
     */
    @Column(name = "id_producto", nullable = false)
    private Integer idProducto;

    @Column(name = "tipo_operacion", nullable = false, length = 50)
    @Enumerated(EnumType.STRING)
    private TipoOperacionCarritoChatbot tipoOperacion;

    @Column(name = "cantidad_anterior")
    private Integer cantidadAnterior;

    @Column(name = "cantidad_nueva", nullable = false)
    private Integer cantidadNueva;

    @Column(name = "fecha_operacion", nullable = false)
    @Builder.Default
    private LocalDateTime fechaOperacion = LocalDateTime.now();
}
