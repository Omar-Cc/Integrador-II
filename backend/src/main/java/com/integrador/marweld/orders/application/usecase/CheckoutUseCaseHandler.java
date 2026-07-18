package com.integrador.marweld.orders.application.usecase;

import com.integrador.marweld.auth.domain.model.Cliente;
import com.integrador.marweld.auth.domain.model.Usuario;
import com.integrador.marweld.auth.infrastructure.persistence.repository.ClienteRepository;
import com.integrador.marweld.auth.infrastructure.persistence.repository.UsuarioRepository;
import com.integrador.marweld.cart.domain.model.Carrito;
import com.integrador.marweld.cart.domain.model.DetalleCarrito;
import com.integrador.marweld.cart.domain.model.EstadoCarrito;
import com.integrador.marweld.cart.infrastructure.persistence.repository.CarritoRepository;
import com.integrador.marweld.cart.infrastructure.persistence.repository.DetalleCarritoRepository;
import com.integrador.marweld.cart.infrastructure.persistence.repository.EstadoCarritoRepository;
import com.integrador.marweld.catalog.domain.model.Inventario;
import com.integrador.marweld.catalog.domain.model.Producto;
import com.integrador.marweld.catalog.infrastructure.persistence.repository.InventarioRepository;
import com.integrador.marweld.catalog.infrastructure.persistence.repository.ProductoRepository;
import com.integrador.marweld.notifications.application.service.EmailService;
import com.integrador.marweld.orders.application.command.CheckoutCommand;
import com.integrador.marweld.orders.application.result.CheckoutResult;
import com.integrador.marweld.orders.domain.exception.CheckoutValidationException;
import org.jooq.DSLContext;
import org.jooq.Field;
import org.jooq.Table;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;

import static org.jooq.impl.DSL.field;
import static org.jooq.impl.DSL.name;
import static org.jooq.impl.DSL.table;

@Component
public class CheckoutUseCaseHandler implements CheckoutUseCase {
    private static final Logger log = LoggerFactory.getLogger(CheckoutUseCaseHandler.class);
    private static final BigDecimal DELIVERY_FEE = new BigDecimal("15.00");
    private static final BigDecimal FREE_DELIVERY_THRESHOLD = new BigDecimal("500.00");

    private final UsuarioRepository usuarioRepository;
    private final ClienteRepository clienteRepository;
    private final ProductoRepository productoRepository;
    private final InventarioRepository inventarioRepository;
    private final CarritoRepository carritoRepository;
    private final DetalleCarritoRepository detalleCarritoRepository;
    private final EstadoCarritoRepository estadoCarritoRepository;
    private final DSLContext dsl;
    private final EmailService emailService;
    private final double successProbability;

    public CheckoutUseCaseHandler(
            UsuarioRepository usuarioRepository, ClienteRepository clienteRepository,
            ProductoRepository productoRepository, InventarioRepository inventarioRepository,
            CarritoRepository carritoRepository, DetalleCarritoRepository detalleCarritoRepository,
            EstadoCarritoRepository estadoCarritoRepository, DSLContext dsl, EmailService emailService,
            @Value("${app.checkout.payment.success-probability:0.85}") double successProbability) {
        this.usuarioRepository = usuarioRepository;
        this.clienteRepository = clienteRepository;
        this.productoRepository = productoRepository;
        this.inventarioRepository = inventarioRepository;
        this.carritoRepository = carritoRepository;
        this.detalleCarritoRepository = detalleCarritoRepository;
        this.estadoCarritoRepository = estadoCarritoRepository;
        this.dsl = dsl;
        this.emailService = emailService;
        this.successProbability = Math.max(0d, Math.min(1d, successProbability));
    }

    @Override
    @Transactional
    public CheckoutResult checkout(String userPublicId, CheckoutCommand command) {
        Usuario usuario = usuarioRepository.findByPublicId(UUID.fromString(userPublicId))
                .orElseThrow(() -> new CheckoutValidationException("No existe el usuario autenticado."));
        Cliente cliente = clienteRepository.findByUsuario(usuario)
                .orElseThrow(() -> new CheckoutValidationException("Solo las cuentas de cliente pueden realizar compras."));
        String modalidad = command.modalidadEntrega().trim().toUpperCase(Locale.ROOT);
        validateDelivery(command, modalidad);

        Map<UUID, Integer> requestedItems = aggregate(command.items());
        List<CheckoutLine> lines = loadLines(requestedItems);
        BigDecimal subtotal = lines.stream().map(CheckoutLine::subtotal).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal shipping = "DOMICILIO".equals(modalidad) && subtotal.compareTo(FREE_DELIVERY_THRESHOLD) < 0
                ? DELIVERY_FEE : BigDecimal.ZERO;
        BigDecimal total = subtotal.add(shipping);
        boolean approved = ThreadLocalRandom.current().nextDouble() < successProbability;

        EstadoCarrito cartStatus = estadoCarritoRepository.findByCodigo(approved ? "COMPRADO" : "ABIERTO")
                .orElseThrow(() -> new IllegalStateException("Estado de carrito no configurado."));
        Carrito cart = carritoRepository.save(Carrito.builder()
                .idCliente(cliente.getIdCliente()).estadoCarrito(cartStatus).total(total).build());
        detalleCarritoRepository.saveAll(lines.stream().map(line -> DetalleCarrito.builder()
                .carrito(cart).idProducto(line.product().getIdProducto()).cantidad(line.quantity())
                .precioUnitario(line.price()).subtotal(line.subtotal()).build()).toList());

        UUID orderPublicId = UUID.randomUUID();
        UUID paymentPublicId = UUID.randomUUID();
        String orderStatus = approved ? "PAGADO" : "PENDIENTE";
        String paymentStatus = approved ? "APROBADO" : "RECHAZADO";
        Integer orderId = insertOrder(orderPublicId, cliente.getIdCliente(), cart.getIdCarrito(), orderStatus, total,
                modalidad, command);
        insertOrderLines(orderId, lines);
        insertPayment(paymentPublicId, orderId, total, paymentStatus);
        insertTracking(orderId, orderStatus, approved);

        if (approved) {
            lines.forEach(line -> decreaseStock(line.inventory(), line.quantity()));
        }
        sendEmails(usuario, command.correo(), orderPublicId, total, approved);
        return new CheckoutResult(orderPublicId, paymentPublicId, approved, orderStatus, paymentStatus, total);
    }

    private Map<UUID, Integer> aggregate(List<CheckoutCommand.Item> items) {
        Map<UUID, Integer> result = new LinkedHashMap<>();
        for (CheckoutCommand.Item item : items) {
            if (item == null || item.productoPublicId() == null || item.cantidad() < 1) {
                throw new CheckoutValidationException("El carrito contiene un producto o cantidad inválida.");
            }
            result.merge(item.productoPublicId(), item.cantidad(), Math::addExact);
        }
        if (result.isEmpty()) throw new CheckoutValidationException("No puedes pagar un carrito vacío.");
        return result;
    }

    private List<CheckoutLine> loadLines(Map<UUID, Integer> items) {
        List<CheckoutLine> lines = new ArrayList<>();
        for (var entry : items.entrySet()) {
            Producto product = productoRepository.findByPublicId(entry.getKey())
                    .filter(item -> "ACTIVO".equals(item.getEstado()))
                    .orElseThrow(() -> new CheckoutValidationException("Uno de los productos ya no está disponible."));
            Inventario inventory = inventarioRepository.findByProductoIdProducto(product.getIdProducto())
                    .orElseThrow(() -> new CheckoutValidationException("No hay inventario disponible para " + product.getNombre() + "."));
            if (inventory.getStockActual() < entry.getValue()) {
                throw new CheckoutValidationException("Stock insuficiente para " + product.getNombre() + ".");
            }
            BigDecimal subtotal = product.getPrecio().multiply(BigDecimal.valueOf(entry.getValue()));
            lines.add(new CheckoutLine(product, inventory, entry.getValue(), product.getPrecio(), subtotal));
        }
        return lines;
    }

    private void validateDelivery(CheckoutCommand command, String modalidad) {
        if (!"DOMICILIO".equals(modalidad) && !"TIENDA".equals(modalidad)) {
            throw new CheckoutValidationException("La modalidad de entrega no es válida.");
        }
        if ("DOMICILIO".equals(modalidad) && (blank(command.nombreRecibe()) || blank(command.telefono())
                || blank(command.direccion()) || blank(command.distrito()))) {
            throw new CheckoutValidationException("Completa los datos de entrega a domicilio.");
        }
    }

    private Integer insertOrder(UUID publicId, Integer clientId, Integer cartId, String status, BigDecimal total,
            String modalidad, CheckoutCommand command) {
        Field<Integer> orderId = field(name("id_pedido"), Integer.class);
        var record = dsl.insertInto(table(name("pedidos")))
                .columns(field(name("public_id")), field(name("id_cliente")), field(name("id_carrito")),
                        field(name("id_estado_pedido")), field(name("total")), field(name("fecha_pedido")),
                        field(name("modalidad_entrega")), field(name("direccion_entrega")), field(name("distrito_entrega")),
                        field(name("nombre_receptor")), field(name("telefono_receptor")), field(name("correo_contacto")))
                .values(publicId, clientId, cartId, catalogId("estados_pedido", "id_estado_pedido", status), total,
                        LocalDateTime.now(), modalidad, command.direccion(), command.distrito(), command.nombreRecibe(),
                        command.telefono(), command.correo().trim().toLowerCase(Locale.ROOT))
                .returning(orderId).fetchOne();
        if (record == null) throw new IllegalStateException("No se pudo registrar el pedido.");
        return record.get(orderId);
    }

    private void insertOrderLines(Integer orderId, List<CheckoutLine> lines) {
        for (CheckoutLine line : lines) {
            dsl.insertInto(table(name("detalle_pedido")))
                    .columns(field(name("id_pedido")), field(name("id_producto")), field(name("cantidad")),
                            field(name("precio_unitario")), field(name("subtotal")))
                    .values(orderId, line.product().getIdProducto(), line.quantity(), line.price(), line.subtotal())
                    .execute();
        }
    }

    private void insertPayment(UUID publicId, Integer orderId, BigDecimal total, String status) {
        dsl.insertInto(table(name("pagos")))
                .columns(field(name("public_id")), field(name("id_pedido")), field(name("id_metodo_pago")),
                        field(name("monto")), field(name("id_estado_pago")), field(name("fecha_pago")))
                .values(publicId, orderId, catalogId("metodos_pago", "id_metodo_pago", "TARJETA_CREDITO"), total,
                        catalogId("estados_pago", "id_estado_pago", status), LocalDateTime.now())
                .execute();
    }

    private void insertTracking(Integer orderId, String status, boolean approved) {
        dsl.insertInto(table(name("seguimiento_pedidos")))
                .columns(field(name("id_pedido")), field(name("codigo_estado")), field(name("titulo")),
                        field(name("descripcion")), field(name("fecha_evento")))
                .values(orderId, status, approved ? "Pago confirmado" : "Pago rechazado",
                        approved ? "Tu pago fue aprobado y el pedido quedó confirmado." : "El pago fue rechazado; puedes intentarlo nuevamente.",
                        LocalDateTime.now())
                .execute();
    }

    private Integer catalogId(String tableName, String idColumn, String code) {
        Integer id = dsl.select(field(name(idColumn), Integer.class)).from(table(name(tableName)))
                .where(field(name("codigo"), String.class).eq(code)).fetchOneInto(Integer.class);
        if (id == null) throw new IllegalStateException("Catálogo no configurado: " + tableName + "." );
        return id;
    }

    private void decreaseStock(Inventario inventory, int quantity) {
        inventory.setStockActual(inventory.getStockActual() - quantity);
        inventarioRepository.save(inventory);
    }

    private void sendEmails(Usuario user, String requestedEmail, UUID orderId, BigDecimal total, boolean approved) {
        String recipient = requestedEmail.trim().toLowerCase(Locale.ROOT);
        try {
            if (approved) {
                emailService.sendEmail(recipient, "Pedido confirmado " + shortOrder(orderId), orderEmail(user.getNombre(), orderId, total));
                emailService.sendEmail(recipient, "Pago aprobado " + shortOrder(orderId), paymentEmail(user.getNombre(), orderId, total, true));
            } else {
                emailService.sendEmail(recipient, "Pago rechazado " + shortOrder(orderId), paymentEmail(user.getNombre(), orderId, total, false));
            }
        } catch (Exception ex) {
            log.error("checkout_email_failed orderPublicId={} recipient={}", orderId, recipient, ex);
        }
    }

    private static String orderEmail(String name, UUID orderId, BigDecimal total) {
        return "<h2>Hola, " + html(name) + "</h2><p>Registramos tu pedido <strong>" + shortOrder(orderId)
                + "</strong> por <strong>S/ " + total + "</strong>.</p><p>Te avisaremos cuando sea despachado.</p>";
    }

    private static String paymentEmail(String name, UUID orderId, BigDecimal total, boolean approved) {
        String outcome = approved ? "fue aprobado" : "fue rechazado";
        String detail = approved ? "Tu pedido quedó confirmado." : "No se realizó ningún cobro. Puedes intentar nuevamente.";
        return "<h2>Hola, " + html(name) + "</h2><p>El pago de tu pedido <strong>" + shortOrder(orderId)
                + "</strong> por <strong>S/ " + total + "</strong> " + outcome + ".</p><p>" + detail + "</p>";
    }

    private static String shortOrder(UUID orderId) { return "MW-" + orderId.toString().substring(0, 8).toUpperCase(Locale.ROOT); }
    private static String html(String value) { return value.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;"); }
    private static boolean blank(String value) { return value == null || value.isBlank(); }

    private record CheckoutLine(Producto product, Inventario inventory, int quantity, BigDecimal price, BigDecimal subtotal) { }
}
