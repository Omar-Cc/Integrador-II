package com.integrador.marweld.auth.application.usecase;

import com.integrador.marweld.auth.application.command.MfaAuthenticatedCommand;
import com.integrador.marweld.auth.application.result.EmailMfaSetupResult;

public interface StartEmailMfaSetupUseCase {
    EmailMfaSetupResult startEmailMfaSetup(MfaAuthenticatedCommand command);
}
