package com.integrador.marweld.auth.application.command;

import java.util.UUID;

public record MfaAuthenticatedCommand(UUID userPublicId) {
}
