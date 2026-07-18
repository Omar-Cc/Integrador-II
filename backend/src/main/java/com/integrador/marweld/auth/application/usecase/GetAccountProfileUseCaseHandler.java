package com.integrador.marweld.auth.application.usecase;

import com.integrador.marweld.auth.application.result.AccountProfileResult;
import com.integrador.marweld.auth.domain.exception.UserNotFoundException;
import com.integrador.marweld.auth.domain.model.Cliente;
import com.integrador.marweld.auth.domain.model.Usuario;
import com.integrador.marweld.auth.infrastructure.persistence.repository.ClienteRepository;
import com.integrador.marweld.auth.infrastructure.persistence.repository.UsuarioRepository;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class GetAccountProfileUseCaseHandler implements GetAccountProfileUseCase {
    private final UsuarioRepository usuarioRepository;
    private final ClienteRepository clienteRepository;

    public GetAccountProfileUseCaseHandler(UsuarioRepository usuarioRepository, ClienteRepository clienteRepository) {
        this.usuarioRepository = usuarioRepository;
        this.clienteRepository = clienteRepository;
    }

    @Override
    public AccountProfileResult getAccountProfile(String userPublicId) {
        Usuario usuario = usuarioRepository.findByPublicId(UUID.fromString(userPublicId))
                .orElseThrow(UserNotFoundException::new);
        Cliente cliente = clienteRepository.findByUsuario(usuario).orElse(null);

        return new AccountProfileResult(
                usuario.getPublicId(),
                usuario.getNombre(),
                usuario.getCorreo(),
                usuario.getTelefono(),
                cliente == null ? null : cliente.getDireccion(),
                cliente == null ? null : cliente.getDocumento(),
                usuario.getFechaRegistro()
        );
    }
}
