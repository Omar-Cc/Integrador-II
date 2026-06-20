package com.integrador.marweld.chatbot.domain.model;

import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Entidad de dominio que representa los productos asociados a un mensaje del chatbot y su rol conversacional.
 */
@Entity
@Table(name = "productos_mensaje_chatbot")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductosMensajeChatbot {

    @EmbeddedId
    private ProductosMensajeChatbotId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("idMensajeChatbot")
    @JoinColumn(name = "id_mensaje_chatbot")
    private MensajeChatbot mensajeChatbot;
}
