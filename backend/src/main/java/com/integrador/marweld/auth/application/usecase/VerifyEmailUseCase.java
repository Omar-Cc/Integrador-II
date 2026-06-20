package com.integrador.marweld.auth.application.usecase;

import com.integrador.marweld.auth.application.command.VerifyEmailCommand;
import com.integrador.marweld.auth.application.result.EmailVerificationResult;

public interface VerifyEmailUseCase {
    EmailVerificationResult handle(VerifyEmailCommand command);
}
