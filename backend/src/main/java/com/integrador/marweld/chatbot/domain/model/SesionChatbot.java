package com.integrador.marweld.chatbot.domain.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entidad de dominio que representa una sesión activa de interacción con el chatbot.
 */
@Entity
@Table(name = "sesiones_chatbot")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SesionChatbot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_sesion_chatbot")
    private Integer idSesionChatbot;

    @Column(name = "public_id", nullable = false, unique = true, updatable = false)
    @Builder.Default
    private UUID publicId = UUID.randomUUID();

    @Column(name = "tipo_actor", nullable = false, length = 30)
    private String tipoActor;

    /**
     * ID de cliente si el actor está logueado como cliente.
     * Mapeado plano para evitar acoplamiento con la entidad del módulo de clientes.
     */
    @Column(name = "id_cliente")
    private Integer idCliente;

    /**
     * ID de trabajador si el actor es un trabajador del sistema.
     * Mapeado plano para evitar acoplamiento con el módulo de personal/trabajadores.
     */
    @Column(name = "id_trabajador")
    private Integer idTrabajador;

    @Column(name = "token_visitante", length = 80)
    private String tokenVisitante;

    /**
     * ID de carrito de compras activo asociado a esta sesión.
     * Mapeado plano para evitar acoplamiento con el módulo de e-commerce.
     */
    @Column(name = "id_carrito")
    private Integer idCarrito;

    @Column(name = "estado", nullable = false, length = 30)
    @Builder.Default
    private String estado = "ABIERTA";

    @Column(name = "fecha_inicio", nullable = false)
    @Builder.Default
    private LocalDateTime fechaInicio = LocalDateTime.now();

    @Column(name = "fecha_cierre")
    private LocalDateTime fechaCierre;
}
