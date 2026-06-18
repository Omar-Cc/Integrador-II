package com.integrador.marweld.chatbot.domain.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.util.Objects;

/**
 * Clave primaria compuesta para la relación de productos de un mensaje de chatbot.
 */
@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductosMensajeChatbotId implements Serializable {

    @Column(name = "id_mensaje_chatbot")
    private Integer idMensajeChatbot;

    @Column(name = "id_producto")
    private Integer idProducto;

    @Column(name = "rol_producto", length = 50)
    @Enumerated(EnumType.STRING)
    private RolProductoMensaje rolProducto;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ProductosMensajeChatbotId that = (ProductosMensajeChatbotId) o;
        return Objects.equals(idMensajeChatbot, that.idMensajeChatbot) &&
                Objects.equals(idProducto, that.idProducto) &&
                rolProducto == that.rolProducto;
    }

    @Override
    public int hashCode() {
        return Objects.hash(idMensajeChatbot, idProducto, rolProducto);
    }
}
