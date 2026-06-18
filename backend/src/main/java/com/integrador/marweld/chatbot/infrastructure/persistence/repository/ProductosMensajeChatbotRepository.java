package com.integrador.marweld.chatbot.infrastructure.persistence.repository;

import com.integrador.marweld.chatbot.domain.model.ProductosMensajeChatbot;
import com.integrador.marweld.chatbot.domain.model.ProductosMensajeChatbotId;
import com.integrador.marweld.chatbot.domain.model.RolProductoMensaje;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repositorio JPA para acceder a los datos de la entidad ProductosMensajeChatbot.
 */
@Repository
public interface ProductosMensajeChatbotRepository extends JpaRepository<ProductosMensajeChatbot, ProductosMensajeChatbotId> {

    /**
     * Obtiene todos los productos registrados para un mensaje específico.
     *
     * @param idMensajeChatbot ID interno del mensaje de chatbot.
     * @return Lista de relaciones de productos en el mensaje.
     */
    List<ProductosMensajeChatbot> findByIdIdMensajeChatbot(Integer idMensajeChatbot);

    /**
     * Obtiene productos de un mensaje filtrados por su rol conversacional.
     *
     * @param idMensajeChatbot ID interno del mensaje de chatbot.
     * @param rolProducto Rol del producto (ej. 'RECOMENDADO').
     * @return Lista de relaciones de productos.
     */
    List<ProductosMensajeChatbot> findByIdIdMensajeChatbotAndIdRolProducto(Integer idMensajeChatbot, RolProductoMensaje rolProducto);
}
