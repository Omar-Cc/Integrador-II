package com.integrador.marweld.catalog.domain.model;

/**
 * Enum que representa los distintos tipos de relaciones de compatibilidad,
 * consumo o sustitución entre productos en Marweld.
 */
public enum TipoRelacionProducto {
    /**
     * Insumos consumibles directos (ej. electrodos para máquina de soldar).
     */
    CONSUMIBLE_DE,

    /**
     * Partes o repuestos de reemplazo técnico (ej. boquilla para antorcha).
     */
    REPUESTO_DE,

    /**
     * Accesorios complementarios (ej. máscara de soldar para máquina soldadora).
     */
    COMPLEMENTARIO_DE,

    /**
     * Producto alternativo / sustituto por falta de stock.
     */
    SUSTITUTO_DE,

    /**
     * Productos que se suelen comprar en conjunto frecuentemente.
     */
    FRECUENTE_CONJUNTO
}
