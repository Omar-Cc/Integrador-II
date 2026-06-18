package com.integrador.marweld.chatbot.domain.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

/**
 * Entidad de dominio que representa la telemetría e intenciones detectadas en un mensaje de chatbot.
 * Relación 1:1 con MensajeChatbot compartiendo clave primaria.
 */
@Entity
@Table(name = "telemetria_mensaje_chatbot")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TelemetriaMensajeChatbot {

    @Id
    @Column(name = "id_mensaje_chatbot")
    private Integer idMensajeChatbot;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId
    @JoinColumn(name = "id_mensaje_chatbot")
    private MensajeChatbot mensajeChatbot;

    @Column(name = "intent_detectado", length = 100)
    private String intentDetectado;

    @Column(name = "confianza_intent", precision = 5, scale = 4)
    private BigDecimal confianzaIntent;

    @Column(name = "modelo_utilizado", length = 100)
    private String modeloUtilizado;

    @Column(name = "tokens_entrada")
    @Builder.Default
    private Integer tokensEntrada = 0;

    @Column(name = "tokens_salida")
    @Builder.Default
    private Integer tokensSalida = 0;

    @Column(name = "latencia_ms")
    @Builder.Default
    private Integer latenciaMs = 0;
}
