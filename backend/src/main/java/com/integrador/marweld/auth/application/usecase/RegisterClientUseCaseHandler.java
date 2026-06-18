package com.integrador.marweld.auth.application.usecase;

import com.integrador.marweld.auth.application.command.RegisterCommand;
import com.integrador.marweld.auth.application.port.EmailSender;
import com.integrador.marweld.auth.application.result.RegisterResult;
import com.integrador.marweld.auth.domain.exception.DocumentoAlreadyExistsException;
import com.integrador.marweld.auth.domain.exception.EmailAlreadyExistsException;
import com.integrador.marweld.auth.domain.exception.RoleNotFoundException;
import com.integrador.marweld.auth.domain.model.Cliente;
import com.integrador.marweld.auth.domain.model.CodigoVerificacion;
import com.integrador.marweld.auth.domain.model.EstadoCodigo;
import com.integrador.marweld.auth.domain.model.EstadoUsuario;
import com.integrador.marweld.auth.domain.model.Rol;
import com.integrador.marweld.auth.domain.model.Usuario;
import com.integrador.marweld.auth.infrastructure.persistence.repository.ClienteRepository;
import com.integrador.marweld.auth.infrastructure.persistence.repository.CodigoVerificacionRepository;
import com.integrador.marweld.auth.infrastructure.persistence.repository.RolRepository;
import com.integrador.marweld.auth.infrastructure.persistence.repository.UsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Component
public class RegisterClientUseCaseHandler implements RegisterClientUseCase {

    private static final Logger log = LoggerFactory.getLogger(RegisterClientUseCaseHandler.class);
    private static final SecureRandom random = new SecureRandom();

    private final UsuarioRepository usuarioRepository;
    private final ClienteRepository clienteRepository;
    private final RolRepository rolRepository;
    private final CodigoVerificacionRepository codigoVerificacionRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailSender emailSender;

    private volatile Rol cachedRolCliente;

    public RegisterClientUseCaseHandler(
            UsuarioRepository usuarioRepository,
            ClienteRepository clienteRepository,
            RolRepository rolRepository,
            CodigoVerificacionRepository codigoVerificacionRepository,
            PasswordEncoder passwordEncoder,
            EmailSender emailSender) {
        this.usuarioRepository = usuarioRepository;
        this.clienteRepository = clienteRepository;
        this.rolRepository = rolRepository;
        this.codigoVerificacionRepository = codigoVerificacionRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailSender = emailSender;
    }

    private Rol getRolCliente() {
        if (cachedRolCliente == null) {
            synchronized (this) {
                if (cachedRolCliente == null) {
                    cachedRolCliente = rolRepository.findByNombreRol("CLIENTE")
                            .orElseThrow(() -> {
                                log.error("Error de configuración: El rol 'CLIENTE' no fue encontrado en la base de datos");
                                return new RoleNotFoundException("CLIENTE");
                            });
                }
            }
        }
        return cachedRolCliente;
    }

    @Override
    public RegisterResult handle(RegisterCommand command) {
        log.info("Iniciando el proceso de registro de cliente para el correo: {}", command.correo());

        // 1. Normalizar los datos
        String correoNormalizado = command.correo().trim().toLowerCase();
        String documentoNormalizado = command.documento().trim();
        String nombreNormalizado = command.nombre().trim();
        String telefonoNormalizado = command.telefono() != null ? command.telefono().trim() : null;
        String direccionNormalizada = command.direccion().trim();

        // 2. Buscar rol CLIENTE (Optimizado mediante caché en memoria)
        Rol rolCliente = getRolCliente();

        // 3. Hashear la contraseña
        String contrasenaHasheada = passwordEncoder.encode(command.contrasena());

        // 5. Crear y persistir el Usuario
        Usuario usuario = new Usuario(
                rolCliente,
                nombreNormalizado,
                correoNormalizado,
                contrasenaHasheada,
                telefonoNormalizado,
                EstadoUsuario.PENDIENTE_VERIFICACION_CORREO
        );
        usuario = usuarioRepository.save(usuario);
        log.debug("Registro de Usuario persistido con ID: {} y publicId: {}", usuario.getIdUsuario(), usuario.getPublicId());

        // 6. Crear y persistir el Cliente
        Cliente cliente = new Cliente(
                usuario,
                direccionNormalizada,
                documentoNormalizado
        );
        cliente = clienteRepository.save(cliente);
        log.debug("Registro de Cliente persistido con ID: {} y publicId: {}", cliente.getIdCliente(), cliente.getPublicId());

        // 7. Generar un OTP aleatorio de 6 dígitos
        int codeInt = random.nextInt(900000) + 100000;
        String otp = String.valueOf(codeInt);

        // 8. Crear y persistir el Código de Verificación
        LocalDateTime fechaExpiracion = LocalDateTime.now().plusMinutes(15);
        CodigoVerificacion codigoVerificacion = new CodigoVerificacion(
                usuario,
                otp,
                fechaExpiracion,
                EstadoCodigo.PENDIENTE
        );
        codigoVerificacionRepository.save(codigoVerificacion);
        log.debug("Código de verificación OTP persistido para el usuario ID: {}", usuario.getIdUsuario());

        // 9. Enviar correo de validación usando el Port
        log.info("Despachando correo electrónico de verificación hacia: {}", correoNormalizado);
        emailSender.sendVerificationEmail(correoNormalizado, nombreNormalizado, otp);

        log.info("Cliente registrado con éxito, pendiente de verificación de correo. UUID de Usuario: {}", usuario.getPublicId());

        return new RegisterResult(
                usuario.getPublicId(),
                cliente.getPublicId(),
                usuario.getNombre(),
                usuario.getCorreo(),
                usuario.getEstado().name()
        );
    }
}
