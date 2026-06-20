package com.integrador.marweld.auth.domain.exception;

import com.integrador.marweld.core.exception.NotFoundException;

public class RoleNotFoundException extends NotFoundException {
    public RoleNotFoundException(String roleName) {
        super("Role not found: " + roleName, "ROLE_NOT_FOUND");
    }
}
