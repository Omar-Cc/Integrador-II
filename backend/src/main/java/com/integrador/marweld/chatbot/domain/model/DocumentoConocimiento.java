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
 * Entidad de dominio que representa un documento de ayuda o conocimiento para el RAG del chatbot.
 */
@Entity
@Table(name = "documentos_conocimiento")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocumentoConocimiento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_documento")
    private Integer idDocumento;

    @Column(name = "public_id", nullable = false, unique = true, updatable = false)
    @Builder.Default
    private UUID publicId = UUID.randomUUID();

    @Column(name = "titulo", nullable = false, length = 255)
    private String titulo;

    @Column(name = "contenido", nullable = false, columnDefinition = "TEXT")
    private String contenido;

    @Column(name = "fuente_url", length = 255)
    private String fuenteUrl;

    @Column(name = "categoria", nullable = false, length = 80)
    @Builder.Default
    private String categoria = "GENERAL";

    @Column(name = "estado", nullable = false, length = 30)
    @Builder.Default
    private String estado = "ACTIVO";

    @Column(name = "fecha_creacion", nullable = false)
    @Builder.Default
    private LocalDateTime fechaCreacion = LocalDateTime.now();
}
