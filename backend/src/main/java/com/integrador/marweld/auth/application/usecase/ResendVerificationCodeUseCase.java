package com.integrador.marweld.auth.application.usecase;

import com.integrador.marweld.auth.application.command.ResendVerificationCodeCommand;
import com.integrador.marweld.auth.application.result.EmailVerificationResult;

public interface ResendVerificationCodeUseCase {
    EmailVerificationResult handle(ResendVerificationCodeCommand command);
}
