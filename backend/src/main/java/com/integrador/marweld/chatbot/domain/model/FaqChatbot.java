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

/**
 * Entidad de dominio que representa una pregunta frecuente (FAQ) en el módulo del chatbot.
 */
@Entity
@Table(name = "faq_chatbot")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FaqChatbot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_faq")
    private Integer idFaq;

    @Column(name = "pregunta", nullable = false, length = 255, unique = true)
    private String pregunta;

    @Column(name = "respuesta", nullable = false, columnDefinition = "TEXT")
    private String respuesta;

    @Column(name = "palabras_clave", columnDefinition = "TEXT")
    private String palabrasClave;

    @Column(name = "categoria", nullable = false, length = 80)
    @Builder.Default
    private String categoria = "GENERAL";

    @Column(name = "estado", nullable = false, length = 30)
    @Builder.Default
    private String estado = "ACTIVO";
}
