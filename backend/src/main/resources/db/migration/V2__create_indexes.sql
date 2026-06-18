-- V2__create_indexes.sql
-- Índices de performance para Marweld Backend.
-- Optimiza consultas frecuentes, búsquedas y joins.
-- Se omiten los índices implícitos de PK y UNIQUE para evitar duplicados.

-- =========================================================================
-- SEGURIDAD Y ACCESO (ROLES, USUARIOS Y SESIONES)
-- =========================================================================

-- Optimización de joins en la tabla puente de roles y permisos
CREATE INDEX idx_rol_permiso_id_rol ON rol_permiso (id_rol);
CREATE INDEX idx_rol_permiso_id_permiso ON rol_permiso (id_permiso);

-- Búsqueda de usuarios por rol
CREATE INDEX idx_usuarios_id_rol ON usuarios (id_rol);

-- Recuperacion de metodos MFA activos o pendientes por usuario
CREATE INDEX idx_usuarios_mfa_metodos_usuario_estado
    ON usuarios_mfa_metodos (id_usuario, estado);

-- Validacion de codigos MFA por email pendientes y vigentes
CREATE INDEX idx_codigos_mfa_email_usuario_estado_expiracion
    ON codigos_mfa_email (id_usuario, estado, fecha_expiracion);

-- Recuperación de sesiones activas de un usuario específico
CREATE INDEX idx_sesiones_usuario_id_usuario ON sesiones_usuario (id_usuario);
CREATE INDEX idx_sesiones_usuario_estado ON sesiones_usuario (estado);

-- Validación rápida de tokens de refresco activos durante autenticación
CREATE INDEX idx_refresh_tokens_id_sesion_usuario ON refresh_tokens (id_sesion_usuario);
CREATE INDEX idx_refresh_tokens_estado_expiracion ON refresh_tokens (estado, fecha_expiracion);

-- Proceso background de depuración (cleanup) de registros expirados
CREATE INDEX idx_jwt_revocados_fecha_expiracion ON jwt_revocados (fecha_expiracion);

-- =========================================================================
-- CATÁLOGO DE PRODUCTOS E INVENTARIO
-- =========================================================================

-- Listar productos filtrando por categoría (ej. menú de navegación)
CREATE INDEX idx_productos_id_categoria ON productos (id_categoria);

-- Filtro recurrente para omitir productos inactivos en catálogo público
CREATE INDEX idx_productos_estado ON productos (estado);

-- Auditoría e historial de movimientos de inventario por producto o autor
CREATE INDEX idx_movimientos_inventario_id_producto ON movimientos_inventario (id_producto);
CREATE INDEX idx_movimientos_inventario_id_usuario ON movimientos_inventario (id_usuario);

-- Listar reseñas asociadas a un producto o auditar historial de reseñas por cliente
CREATE INDEX idx_resenas_producto_id_producto ON resenas_producto (id_producto);
CREATE INDEX idx_resenas_producto_id_cliente ON resenas_producto (id_cliente);

-- =========================================================================
-- CARRITO DE COMPRAS Y TRANSACCIONES
-- =========================================================================

-- Recuperación del carrito del cliente registrado o del visitante anónimo
CREATE INDEX idx_carritos_id_cliente ON carritos (id_cliente);
CREATE INDEX idx_carritos_token_visitante ON carritos (token_visitante);

-- Joins y operaciones en el detalle del carrito
CREATE INDEX idx_detalle_carrito_id_carrito ON detalle_carrito (id_carrito);
CREATE INDEX idx_detalle_carrito_id_producto ON detalle_carrito (id_producto);

-- =========================================================================
-- PEDIDOS Y VENTAS (POS)
-- =========================================================================

-- Historial de pedidos por cliente y referencia a su carrito origen
CREATE INDEX idx_pedidos_id_cliente ON pedidos (id_cliente);
CREATE INDEX idx_pedidos_id_carrito ON pedidos (id_carrito);

-- Seguimiento administrativo de pedidos por su estado (ej. Bandeja de envíos)
CREATE INDEX idx_pedidos_id_estado_pedido ON pedidos (id_estado_pedido);

-- Joins y visualización del detalle del pedido
CREATE INDEX idx_detalle_pedido_id_pedido ON detalle_pedido (id_pedido);
CREATE INDEX idx_detalle_pedido_id_producto ON detalle_pedido (id_producto);

-- Auditoría de ventas POS por cajero y cliente
CREATE INDEX idx_ventas_pos_id_trabajador ON ventas_pos (id_trabajador);
CREATE INDEX idx_ventas_pos_id_cliente ON ventas_pos (id_cliente);

-- Joins y visualización del detalle de ventas POS
CREATE INDEX idx_detalle_venta_pos_id_venta_pos ON detalle_venta_pos (id_venta_pos);
CREATE INDEX idx_detalle_venta_pos_id_producto ON detalle_venta_pos (id_producto);

-- =========================================================================
-- PAGOS Y FACTURACIÓN
-- =========================================================================

-- Búsqueda de pagos asociados a transacciones y filtros de control financiero
CREATE INDEX idx_pagos_id_pedido ON pagos (id_pedido);
CREATE INDEX idx_pagos_id_venta_pos ON pagos (id_venta_pos);
CREATE INDEX idx_pagos_id_estado_pago ON pagos (id_estado_pago);

-- =========================================================================
-- EVENTOS Y NOTIFICACIONES (BACKGROUND PROCESSING)
-- =========================================================================

-- Cola de procesamiento de eventos en segundo plano
CREATE INDEX idx_eventos_sistema_tipo_evento ON eventos_sistema (tipo_evento);
CREATE INDEX idx_eventos_sistema_estado_fecha ON eventos_sistema (estado, fecha_evento);

-- Bandeja de notificaciones no leídas de un usuario (para badge de UI)
CREATE INDEX idx_notificaciones_id_usuario_estado ON notificaciones (id_usuario, estado);
CREATE INDEX idx_notificaciones_fecha_creacion ON notificaciones (fecha_creacion);

-- Planificación y envío asíncrono de notificaciones por canales
CREATE INDEX idx_entregas_notificacion_canal_estado ON entregas_notificacion (canal, estado);
CREATE INDEX idx_entregas_notificacion_fecha_programada ON entregas_notificacion (fecha_programada);

-- =========================================================================
-- CHATBOT DE ASISTENCIA
-- =========================================================================

-- Contextualización de la sesión del chatbot
CREATE INDEX idx_sesiones_chatbot_id_cliente ON sesiones_chatbot (id_cliente);
CREATE INDEX idx_sesiones_chatbot_id_trabajador ON sesiones_chatbot (id_trabajador);
CREATE INDEX idx_sesiones_chatbot_token_visitante ON sesiones_chatbot (token_visitante);
CREATE INDEX idx_sesiones_chatbot_id_carrito ON sesiones_chatbot (id_carrito);

-- Cargar historial de conversación de forma cronológica en la interfaz de chat
CREATE INDEX idx_mensajes_chatbot_sesion_fecha ON mensajes_chatbot (id_sesion_chatbot, fecha_mensaje);

-- Búsqueda rápida de FAQs activas en el chatbot
CREATE INDEX idx_faq_chatbot_estado ON faq_chatbot (estado);

-- =========================================================================
-- SOLICITUDES DE REPOSICIÓN Y PROVEEDORES
-- =========================================================================

-- Búsqueda de solicitudes de reposición por producto
CREATE INDEX idx_solicitudes_reposicion_id_producto ON solicitudes_reposicion (id_producto);

-- Filtrado por usuario solicitante
CREATE INDEX idx_solicitudes_reposicion_id_usuario_solicitante ON solicitudes_reposicion (id_usuario_solicitante);

-- Filtrado por proveedor sugerido
CREATE INDEX idx_solicitudes_reposicion_id_proveedor_sugerido ON solicitudes_reposicion (id_proveedor_sugerido);

-- Bandeja de entrada / seguimiento por estado de la solicitud
CREATE INDEX idx_solicitudes_reposicion_id_estado_reposicion ON solicitudes_reposicion (id_estado_reposicion);

-- Búsqueda cronológica e informes por fecha de solicitud
CREATE INDEX idx_solicitudes_reposicion_fecha_solicitud ON solicitudes_reposicion (fecha_solicitud);

-- =========================================================================
-- ÍNDICES PARA EL MÓDULO DE CHATBOT Y CLASIFICACIÓN
-- =========================================================================

-- Optimización de búsqueda de productos por su tipo
CREATE INDEX idx_productos_id_tipo_producto ON productos (id_tipo_producto);

-- Búsquedas y filtros en especificaciones de productos
CREATE INDEX idx_especificaciones_producto_buscar ON especificaciones_producto (id_producto, clave);

-- Cargar sugerencias y relaciones asociadas de manera veloz
CREATE INDEX idx_relaciones_producto_origen ON relaciones_producto (id_producto_origen);
CREATE INDEX idx_relaciones_producto_destino ON relaciones_producto (id_producto_destino);

-- Filtro de documentos de conocimiento
CREATE INDEX idx_documentos_conocimiento_estado ON documentos_conocimiento (estado, categoria);

-- Auditoría de carritos a nivel de carrito afectado
CREATE INDEX idx_auditoria_carrito_carrito_id ON auditoria_carrito_chatbot (id_carrito);

-- Errores asociados a mensajes
CREATE INDEX idx_errores_chatbot_mensaje_id ON errores_chatbot (id_mensaje_chatbot);
