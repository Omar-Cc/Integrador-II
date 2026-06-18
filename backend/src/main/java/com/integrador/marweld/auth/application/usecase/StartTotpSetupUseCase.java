package com.integrador.marweld.auth.application.usecase;

import com.integrador.marweld.auth.application.command.MfaAuthenticatedCommand;
import com.integrador.marweld.auth.application.result.TotpSetupResult;

public interface StartTotpSetupUseCase {
    TotpSetupResult startTotpSetup(MfaAuthenticatedCommand command);
}
