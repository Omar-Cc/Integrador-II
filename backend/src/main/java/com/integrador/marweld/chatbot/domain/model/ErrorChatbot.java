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
 * Entidad de dominio que representa los errores conversacionales o técnicos sufridos por el chatbot.
 */
@Entity
@Table(name = "errores_chatbot")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ErrorChatbot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_error")
    private Integer idError;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_mensaje_chatbot")
    private MensajeChatbot mensajeChatbot;

    @Column(name = "codigo_error", nullable = false, length = 80)
    private String codigoError;

    @Column(name = "mensaje_error", nullable = false, columnDefinition = "TEXT")
    private String mensajeError;

    @Column(name = "detalle_tecnico", columnDefinition = "TEXT")
    private String detalleTecnico;

    @Column(name = "fecha_error", nullable = false)
    @Builder.Default
    private LocalDateTime fechaError = LocalDateTime.now();
}
