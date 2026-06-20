-- V3__seed_data.sql
-- Datos semilla iniciales e indispensables para Marweld Backend.
-- Garantiza la idempotencia mediante la cláusula ON CONFLICT.

-- =========================================================================
-- ROLES
-- =========================================================================
INSERT INTO roles (nombre_rol, descripcion, estado) VALUES
    ('ADMINISTRADOR', 'Rol con control total sobre el sistema.', 'ACTIVO'),
    ('TRABAJADOR', 'Rol para trabajadores de la tienda y cajeros POS.', 'ACTIVO'),
    ('CLIENTE', 'Rol para clientes finales de la plataforma e-commerce.', 'ACTIVO')
ON CONFLICT (nombre_rol) DO NOTHING;

-- =========================================================================
-- PERMISOS
-- =========================================================================
INSERT INTO permisos (nombre_permiso, descripcion) VALUES
    ('GESTIONAR_USUARIOS', 'Permite crear, editar y desactivar usuarios.'),
    ('GESTIONAR_PRODUCTOS', 'Permite administrar el catálogo de productos.'),
    ('GESTIONAR_INVENTARIO', 'Permite registrar entradas, salidas y ajustes de inventario.'),
    ('REALIZAR_VENTA_POS', 'Permite registrar transacciones y cobros en el terminal POS.'),
    ('VER_REPORTES', 'Permite acceder a tableros y reportes financieros/operativos.'),
    ('ACCEDER_CHATBOT', 'Permite interactuar con la interfaz del chatbot.')
ON CONFLICT (nombre_permiso) DO NOTHING;

-- =========================================================================
-- ROL_PERMISO (ASOCIACIONES)
-- =========================================================================
-- Administrador: Todos los permisos
INSERT INTO rol_permiso (id_rol, id_permiso)
SELECT r.id_rol, p.id_permiso
FROM roles r, permisos p
WHERE r.nombre_rol = 'ADMINISTRADOR'
ON CONFLICT (id_rol, id_permiso) DO NOTHING;

-- Trabajador: Gestión de productos, inventario, ventas y chatbot
INSERT INTO rol_permiso (id_rol, id_permiso)
SELECT r.id_rol, p.id_permiso
FROM roles r, permisos p
WHERE r.nombre_rol = 'TRABAJADOR'
  AND p.nombre_permiso IN ('GESTIONAR_PRODUCTOS', 'GESTIONAR_INVENTARIO', 'REALIZAR_VENTA_POS', 'ACCEDER_CHATBOT')
ON CONFLICT (id_rol, id_permiso) DO NOTHING;

-- Cliente: Solo chatbot y operaciones básicas inherentes no protegidas
INSERT INTO rol_permiso (id_rol, id_permiso)
SELECT r.id_rol, p.id_permiso
FROM roles r, permisos p
WHERE r.nombre_rol = 'CLIENTE'
  AND p.nombre_permiso IN ('ACCEDER_CHATBOT')
ON CONFLICT (id_rol, id_permiso) DO NOTHING;

-- =========================================================================
-- ESTADOS DE CARRITO
-- =========================================================================
INSERT INTO estados_carrito (codigo, nombre, descripcion) VALUES
    ('ABIERTO', 'Abierto', 'Carrito en uso activo por el cliente o visitante.'),
    ('COMPRADO', 'Comprado', 'Carrito consolidado en un pedido pagado o completado.'),
    ('ABANDONADO', 'Abandonado', 'Carrito inactivo sin conversión tras un periodo de gracia.')
ON CONFLICT (codigo) DO NOTHING;

-- =========================================================================
-- ESTADOS DE PEDIDO
-- =========================================================================
INSERT INTO estados_pedido (codigo, nombre, descripcion) VALUES
    ('PENDIENTE', 'Pendiente', 'Pedido registrado esperando confirmación de pago o revisión.'),
    ('PAGADO', 'Pagado', 'Pago acreditado con éxito.'),
    ('ENVIADO', 'Enviado', 'Productos despachados en camino a la dirección de entrega.'),
    ('ENTREGADO', 'Entregado', 'Pedido recibido conforme por el cliente.'),
    ('CANCELADO', 'Cancelado', 'Pedido anulado antes de ser despachado.')
ON CONFLICT (codigo) DO NOTHING;

-- =========================================================================
-- ESTADOS DE PAGO
-- =========================================================================
INSERT INTO estados_pago (codigo, nombre, descripcion) VALUES
    ('PENDIENTE', 'Pendiente', 'Transacción iniciada en espera de verificación o respuesta de pasarela.'),
    ('APROBADO', 'Aprobado', 'Pago validado y fondos recibidos con éxito.'),
    ('RECHAZADO', 'Rechazado', 'Transacción fallida o denegada por el banco/pasarela.'),
    ('REEMBOLSADO', 'Reembolsado', 'Monto devuelto al cliente tras cancelación del pedido.')
ON CONFLICT (codigo) DO NOTHING;

-- =========================================================================
-- MÉTODOS DE PAGO
-- =========================================================================
INSERT INTO metodos_pago (codigo, nombre, descripcion) VALUES
    ('EFECTIVO', 'Efectivo', 'Pago en metálico en caja POS física.'),
    ('TARJETA_CREDITO', 'Tarjeta de Crédito', 'Tarjeta de crédito procesada online o terminal POS.'),
    ('TARJETA_DEBITO', 'Tarjeta de Débito', 'Tarjeta de débito procesada online o terminal POS.'),
    ('TRANSFERENCIA', 'Transferencia Bancaria', 'Transferencia directa interbancaria.'),
    ('YAPE_PLIN', 'Pago Móvil (Yape/Plin)', 'Pago móvil a través de billetera digital (Yape o Plin).')
ON CONFLICT (codigo) DO NOTHING;

-- =========================================================================
-- TIPOS DE MOVIMIENTO DE INVENTARIO
-- =========================================================================
INSERT INTO tipos_movimiento (codigo, nombre, descripcion) VALUES
    ('INGRESO_COMPRA', 'Ingreso por Compra', 'Entrada de mercancía por abastecimiento o compra a proveedor.'),
    ('EGRESO_VENTA', 'Egreso por Venta', 'Salida de producto por concepto de venta (POS o e-commerce).'),
    ('AJUSTE_INVENTARIO', 'Ajuste de Inventario', 'Corrección manual de stock por merma, rotura o auditoría.'),
    ('DEVOLUCION', 'Devolución', 'Reingreso de producto por devolución del cliente.')
ON CONFLICT (codigo) DO NOTHING;

-- =========================================================================
-- TIPOS DE NOTIFICACIÓN
-- =========================================================================
INSERT INTO tipos_notificacion (codigo, nombre, descripcion) VALUES
    ('ALERTA_STOCK', 'Alerta de Stock', 'Notificación técnica de stock mínimo o desabastecimiento.'),
    ('ESTADO_PEDIDO', 'Estado de Pedido', 'Actualización al cliente sobre el tránsito de su pedido.'),
    ('CONFIRMACION_PAGO', 'Confirmación de Pago', 'Aviso al cliente sobre la recepción correcta de su pago.'),
    ('BIENVENIDA', 'Bienvenida', 'Mensaje de bienvenida tras el registro del usuario en la plataforma.')
ON CONFLICT (codigo) DO NOTHING;

-- =========================================================================
-- FAQs DEL CHATBOT
-- =========================================================================
INSERT INTO faq_chatbot (pregunta, respuesta, palabras_clave, categoria, estado) VALUES
    ('¿Cuáles son los métodos de pago aceptados?', 'Aceptamos Efectivo en tienda física, Tarjetas de Crédito/Débito, Transferencias Bancarias y billeteras móviles (Yape/Plin).', 'pago, metodos, tarjeta, yape, plin, efectivo', 'PAGOS', 'ACTIVO'),
    ('¿Cómo sé el estado de mi pedido?', 'Puedes hacer seguimiento del tránsito de tu pedido desde la bandeja de notificaciones de tu perfil de usuario.', 'pedido, estado, seguimiento, compra', 'ENVIOS', 'ACTIVO'),
    ('¿Cuáles son los horarios de atención?', 'Nuestros horarios de atención son de lunes a sábado de 8:00 AM a 6:00 PM.', 'horario, atencion, hora, apertura, cierre', 'GENERAL', 'ACTIVO')
ON CONFLICT (pregunta) DO NOTHING;

-- =========================================================================
-- ESTADOS DE REPOSICIÓN DE PRODUCTO
-- =========================================================================
INSERT INTO estados_reposicion (codigo, nombre, descripcion) VALUES
    ('PENDIENTE', 'Pendiente', 'Solicitud creada en espera de revisión por un administrador.'),
    ('APROBADO', 'Aprobado', 'Solicitud aprobada por el administrador.'),
    ('RECHAZADO', 'Rechazado', 'Solicitud rechazada por el administrador.'),
    ('RECIBIDO', 'Recibido', 'Productos recibidos e ingresados al inventario.'),
    ('CANCELADO', 'Cancelado', 'Solicitud cancelada por el solicitante antes de ser aprobada.')
ON CONFLICT (codigo) DO NOTHING;

-- =========================================================================
-- NUEVO TIPO DE MOVIMIENTO DE INVENTARIO
-- =========================================================================
INSERT INTO tipos_movimiento (codigo, nombre, descripcion) VALUES
    ('INGRESO_REPOSICION', 'Ingreso por Reposición', 'Entrada de mercadería por solicitud interna de reposición aprobada.')
ON CONFLICT (codigo) DO NOTHING;

-- =========================================================================
-- TIPOS DE PRODUCTO (CATÁLOGO INICIAL)
-- =========================================================================
INSERT INTO tipos_producto (codigo, nombre, descripcion) VALUES
    ('EQUIPO', 'Equipo/Maquinaria', 'Equipos principales como máquinas de soldar, compresoras, etc.'),
    ('CONSUMIBLE', 'Consumible', 'Insumos que se desgastan con el uso directo (electrodos, gas, alambre).'),
    ('REPUESTO', 'Repuesto', 'Componentes reemplazables de un equipo (antorchas, boquillas, rodillos).'),
    ('EPP', 'Equipo de Protección', 'Elementos de seguridad personal (máscaras, guantes, casacas).'),
    ('HERRAMIENTA', 'Herramienta', 'Herramientas manuales o eléctricas complementarias (esmeriles, alicates).'),
    ('GENERAL', 'General / Otro', 'Productos generales no clasificados en las categorías anteriores.')
ON CONFLICT (codigo) DO NOTHING;

