package com.integrador.marweld.chatbot.domain.model;

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
 * Entidad de dominio que representa un mensaje individual dentro de una sesión de chatbot.
 */
@Entity
@Table(name = "mensajes_chatbot")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MensajeChatbot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_mensaje_chatbot")
    private Integer idMensajeChatbot;

    @Column(name = "public_id", nullable = false, unique = true, updatable = false)
    @Builder.Default
    private java.util.UUID publicId = java.util.UUID.randomUUID();

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_sesion_chatbot", nullable = false)
    private SesionChatbot sesionChatbot;

    @Column(name = "emisor", nullable = false, length = 30)
    private String emisor;

    @Column(name = "contenido", nullable = false, columnDefinition = "TEXT")
    private String contenido;

    @Column(name = "fecha_mensaje", nullable = false)
    @Builder.Default
    private LocalDateTime fechaMensaje = LocalDateTime.now();
}
