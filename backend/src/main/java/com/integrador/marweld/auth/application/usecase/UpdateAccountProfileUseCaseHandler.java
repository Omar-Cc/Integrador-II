package com.integrador.marweld.auth.application.usecase;

import com.integrador.marweld.auth.application.command.UpdateAccountProfileCommand;
import com.integrador.marweld.auth.application.result.AccountProfileResult;
import com.integrador.marweld.auth.domain.exception.UserNotFoundException;
import com.integrador.marweld.auth.domain.model.Cliente;
import com.integrador.marweld.auth.domain.model.Usuario;
import com.integrador.marweld.auth.infrastructure.persistence.repository.ClienteRepository;
import com.integrador.marweld.auth.infrastructure.persistence.repository.UsuarioRepository;
import com.integrador.marweld.core.exception.ValidationException;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class UpdateAccountProfileUseCaseHandler implements UpdateAccountProfileUseCase {
    private final UsuarioRepository usuarioRepository;
    private final ClienteRepository clienteRepository;

    public UpdateAccountProfileUseCaseHandler(UsuarioRepository usuarioRepository, ClienteRepository clienteRepository) {
        this.usuarioRepository = usuarioRepository;
        this.clienteRepository = clienteRepository;
    }

    @Override
    public AccountProfileResult updateAccountProfile(String userPublicId, UpdateAccountProfileCommand command) {
        Usuario usuario = usuarioRepository.findByPublicId(UUID.fromString(userPublicId))
                .orElseThrow(UserNotFoundException::new);
        Cliente cliente = clienteRepository.findByUsuario(usuario)
                .orElseThrow(() -> new ProfileValidationException("No existe un perfil de cliente para esta cuenta."));

        String nombre = normalizeRequired(command.nombre(), "El nombre es obligatorio.");
        String direccion = normalizeRequired(command.direccion(), "La dirección principal es obligatoria.");
        String telefono = command.telefono() == null || command.telefono().isBlank() ? null : command.telefono().trim();

        usuario.setNombre(nombre);
        usuario.setTelefono(telefono);
        cliente.setDireccion(direccion);
        usuarioRepository.save(usuario);
        clienteRepository.save(cliente);

        return new AccountProfileResult(usuario.getPublicId(), usuario.getNombre(), usuario.getCorreo(),
                usuario.getTelefono(), cliente.getDireccion(), cliente.getDocumento(), usuario.getFechaRegistro());
    }

    private static String normalizeRequired(String value, String message) {
        if (value == null || value.isBlank()) throw new ProfileValidationException(message);
        return value.trim();
    }

    private static class ProfileValidationException extends ValidationException {
        ProfileValidationException(String message) { super(message, "PROFILE_VALIDATION_ERROR"); }
    }
}
