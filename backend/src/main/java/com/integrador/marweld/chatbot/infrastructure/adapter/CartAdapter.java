package com.integrador.marweld.chatbot.infrastructure.adapter;

import com.integrador.marweld.chatbot.application.port.CartPort;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

/**
 * Adaptador de infraestructura que implementa CartPort.
 * Consulta directamente las tablas carritos y detalle_carrito mediante JdbcTemplate
 * para evitar acoplamiento de entidades JPA entre módulos.
 */
@Component
public class CartAdapter implements CartPort {

    private static final Logger log = LoggerFactory.getLogger(CartAdapter.class);
    private final JdbcTemplate jdbcTemplate;

    public CartAdapter(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public String getCartSummary(Integer idCarrito) {
        if (idCarrito == null) {
            return "Carrito no inicializado (vacío).";
        }

        try {
            String sql = "SELECT p.nombre, dc.cantidad, dc.precio_unitario, dc.subtotal " +
                         "FROM detalle_carrito dc " +
                         "JOIN productos p ON dc.id_producto = p.id_producto " +
                         "WHERE dc.id_carrito = ?";

            List<Map<String, Object>> rows = jdbcTemplate.queryForList(sql, idCarrito);
            if (rows.isEmpty()) {
                return "El carrito de compras está vacío.";
            }

            StringBuilder sb = new StringBuilder("Contenido del carrito:\n");
            for (Map<String, Object> row : rows) {
                sb.append(String.format("- %s: %d unidades x S/. %.2f (Subtotal: S/. %.2f)\n",
                        row.get("nombre"),
                        ((Number) row.get("cantidad")).intValue(),
                        ((Number) row.get("precio_unitario")).doubleValue(),
                        ((Number) row.get("subtotal")).doubleValue()
                ));
            }
            return sb.toString();
        } catch (Exception e) {
            log.warn("Error al intentar recuperar resumen del carrito {} desde la BD: {}", idCarrito, e.getMessage());
            return "No se pudo recuperar el resumen del carrito debido a un error técnico.";
        }
    }
}
