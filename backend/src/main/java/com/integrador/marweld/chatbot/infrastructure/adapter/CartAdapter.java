package com.integrador.marweld.chatbot.infrastructure.adapter;

import com.integrador.marweld.chatbot.application.port.CartPort;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Component;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.List;
import java.util.Map;
import java.util.UUID;

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

    @Override
    public void addProductToCart(Integer idCarrito, java.util.UUID productPublicId, int cantidad) {
        if (idCarrito == null || productPublicId == null || cantidad <= 0) {
            return;
        }

        try {
            // 1. Obtener id_producto e precio_unitario
            String prodSql = "SELECT id_producto, precio FROM productos WHERE public_id = ? AND estado = 'ACTIVO'";
            List<Map<String, Object>> prodRows = jdbcTemplate.queryForList(prodSql, productPublicId);
            if (prodRows.isEmpty()) {
                log.warn("Producto no encontrado o inactivo con publicId: {}", productPublicId);
                return;
            }

            Map<String, Object> prod = prodRows.get(0);
            Integer idProducto = ((Number) prod.get("id_producto")).intValue();
            double precio = ((Number) prod.get("precio")).doubleValue();

            // 2. Verificar si ya existe en el detalle del carrito
            String checkSql = "SELECT id_detalle_carrito, cantidad FROM detalle_carrito WHERE id_carrito = ? AND id_producto = ?";
            List<Map<String, Object>> detailRows = jdbcTemplate.queryForList(checkSql, idCarrito, idProducto);

            if (!detailRows.isEmpty()) {
                // Actualizar cantidad y subtotal
                int cantidadActual = ((Number) detailRows.get(0).get("cantidad")).intValue();
                int nuevaCantidad = cantidadActual + cantidad;
                double nuevoSubtotal = nuevaCantidad * precio;

                String updateSql = "UPDATE detalle_carrito SET cantidad = ?, subtotal = ? WHERE id_carrito = ? AND id_producto = ?";
                jdbcTemplate.update(updateSql, nuevaCantidad, nuevoSubtotal, idCarrito, idProducto);
                log.info("Cantidad de producto {} actualizada en carrito {}. Nueva cantidad: {}", idProducto, idCarrito, nuevaCantidad);
            } else {
                // Insertar nuevo detalle
                double subtotal = cantidad * precio;
                String insertSql = "INSERT INTO detalle_carrito (id_carrito, id_producto, cantidad, precio_unitario, subtotal) VALUES (?, ?, ?, ?, ?)";
                jdbcTemplate.update(insertSql, idCarrito, idProducto, cantidad, precio, subtotal);
                log.info("Producto {} insertado en carrito {}. Cantidad: {}", idProducto, idCarrito, cantidad);
            }

            // 3. Recalcular total del carrito
            updateCartTotal(idCarrito);

        } catch (Exception e) {
            log.error("Error al agregar producto {} al carrito {}: {}", productPublicId, idCarrito, e.getMessage(), e);
        }
    }

    @Override
    public void removeProductFromCart(Integer idCarrito, java.util.UUID productPublicId) {
        if (idCarrito == null || productPublicId == null) {
            return;
        }

        try {
            // 1. Obtener id_producto
            String prodSql = "SELECT id_producto FROM productos WHERE public_id = ?";
            List<Map<String, Object>> prodRows = jdbcTemplate.queryForList(prodSql, productPublicId);
            if (prodRows.isEmpty()) {
                return;
            }

            Integer idProducto = ((Number) prodRows.get(0).get("id_producto")).intValue();

            // 2. Eliminar del detalle del carrito
            String deleteSql = "DELETE FROM detalle_carrito WHERE id_carrito = ? AND id_producto = ?";
            int rowsDeleted = jdbcTemplate.update(deleteSql, idCarrito, idProducto);
            log.info("Eliminado producto {} del carrito {}. Fila eliminada: {}", idProducto, idCarrito, rowsDeleted > 0);

            // 3. Recalcular total del carrito
            updateCartTotal(idCarrito);

        } catch (Exception e) {
            log.error("Error al eliminar producto {} del carrito {}: {}", productPublicId, idCarrito, e.getMessage(), e);
        }
    }

    private void updateCartTotal(Integer idCarrito) {
        String totalSql = "UPDATE carritos SET total = (SELECT COALESCE(SUM(subtotal), 0) FROM detalle_carrito WHERE id_carrito = ?) WHERE id_carrito = ?";
        jdbcTemplate.update(totalSql, idCarrito, idCarrito);
    }

    @Override
    public Integer getOrCreateCart(Integer idCliente, String tokenVisitante) {
        // Generar token si ambos son nulos para no violar constraints
        String finalToken = tokenVisitante;
        if (idCliente == null && (tokenVisitante == null || tokenVisitante.isBlank())) {
            finalToken = "visitante-" + UUID.randomUUID().toString().substring(0, 8);
        }

        try {
            // Intentar recuperar un carrito abierto existente
            String selectSql;
            List<Map<String, Object>> rows;
            if (idCliente != null) {
                selectSql = "SELECT id_carrito FROM carritos WHERE id_cliente = ? " +
                            "AND id_estado_carrito = (SELECT id_estado_carrito FROM estados_carrito WHERE codigo = 'ABIERTO') " +
                            "ORDER BY fecha_creacion DESC LIMIT 1";
                rows = jdbcTemplate.queryForList(selectSql, idCliente);
            } else {
                selectSql = "SELECT id_carrito FROM carritos WHERE token_visitante = ? " +
                            "AND id_estado_carrito = (SELECT id_estado_carrito FROM estados_carrito WHERE codigo = 'ABIERTO') " +
                            "ORDER BY fecha_creacion DESC LIMIT 1";
                rows = jdbcTemplate.queryForList(selectSql, finalToken);
            }

            if (!rows.isEmpty()) {
                Integer idCarrito = ((Number) rows.get(0).get("id_carrito")).intValue();
                log.info("Carrito abierto recuperado existente con ID: {}", idCarrito);
                return idCarrito;
            }

            // Si no existe, crear uno nuevo
            log.info("No se encontró un carrito abierto. Creando uno nuevo para idCliente: {}, tokenVisitante: {}", idCliente, finalToken);
            KeyHolder keyHolder = new GeneratedKeyHolder();
            final String finalTokenParam = finalToken;
            jdbcTemplate.update(connection -> {
                PreparedStatement ps = connection.prepareStatement(
                    "INSERT INTO carritos (public_id, id_cliente, token_visitante, id_estado_carrito, total) " +
                    "VALUES (?, ?, ?, (SELECT id_estado_carrito FROM estados_carrito WHERE codigo = 'ABIERTO'), 0)",
                    Statement.RETURN_GENERATED_KEYS
                );
                ps.setObject(1, UUID.randomUUID());
                if (idCliente != null) {
                    ps.setInt(2, idCliente);
                } else {
                    ps.setNull(2, java.sql.Types.INTEGER);
                }
                if (idCliente != null) {
                    // Si id_cliente no es nulo, token_visitante debe ser nulo por check constraint
                    ps.setNull(3, java.sql.Types.VARCHAR);
                } else {
                    ps.setString(3, finalTokenParam);
                }
                return ps;
            }, keyHolder);

            Number key = keyHolder.getKey();
            if (key == null) {
                // Alternativa para recuperar llave si keyHolder retorna nulo (por ej. en H2)
                String lastIdSql;
                if (idCliente != null) {
                    lastIdSql = "SELECT id_carrito FROM carritos WHERE id_cliente = ? ORDER BY fecha_creacion DESC LIMIT 1";
                    return jdbcTemplate.queryForObject(lastIdSql, Integer.class, idCliente);
                } else {
                    lastIdSql = "SELECT id_carrito FROM carritos WHERE token_visitante = ? ORDER BY fecha_creacion DESC LIMIT 1";
                    return jdbcTemplate.queryForObject(lastIdSql, Integer.class, finalTokenParam);
                }
            }
            Integer idCarrito = key.intValue();
            log.info("Nuevo carrito creado con ID: {}", idCarrito);
            return idCarrito;
        } catch (Exception e) {
            log.error("Error en getOrCreateCart para idCliente: {}, tokenVisitante: {}", idCliente, finalToken, e);
            throw new RuntimeException("Error al gestionar el carrito del chatbot", e);
        }
    }
}
