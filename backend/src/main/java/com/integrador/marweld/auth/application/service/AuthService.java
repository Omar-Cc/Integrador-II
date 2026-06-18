package com.integrador.marweld.auth.application.service;

import com.integrador.marweld.auth.application.command.RegisterCommand;
import com.integrador.marweld.auth.application.command.ResendVerificationCodeCommand;
import com.integrador.marweld.auth.application.command.VerifyEmailCommand;
import com.integrador.marweld.auth.application.result.EmailVerificationResult;
import com.integrador.marweld.auth.application.result.RegisterResult;

public interface AuthService {
    RegisterResult register(RegisterCommand command);
    EmailVerificationResult verifyEmail(VerifyEmailCommand command);
    EmailVerificationResult resendVerificationCode(ResendVerificationCodeCommand command);
}
