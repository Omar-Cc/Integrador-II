package com.integrador.marweld.auth.application.usecase;

import com.integrador.marweld.auth.application.command.MfaAuthenticatedCommand;
import com.integrador.marweld.auth.application.result.MfaStatusResult;

public interface GetMfaStatusUseCase {
    MfaStatusResult getMfaStatus(MfaAuthenticatedCommand command);
}
