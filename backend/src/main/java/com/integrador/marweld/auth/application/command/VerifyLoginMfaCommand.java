package com.integrador.marweld.auth.application.command;

import com.integrador.marweld.auth.domain.model.MetodoMfa;
import java.util.UUID;

public record VerifyLoginMfaCommand(UUID challengePublicId, MetodoMfa method, String codigo,
                                    String ip, String userAgent) {}
