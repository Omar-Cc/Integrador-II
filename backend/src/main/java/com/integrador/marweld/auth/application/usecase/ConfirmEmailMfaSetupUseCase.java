package com.integrador.marweld.auth.application.usecase;

import com.integrador.marweld.auth.application.command.ConfirmMfaCodeCommand;
import com.integrador.marweld.auth.application.result.MfaMethodResult;

public interface ConfirmEmailMfaSetupUseCase {
    MfaMethodResult confirmEmailMfaSetup(ConfirmMfaCodeCommand command);
}
