package com.integrador.marweld.auth.application.service;

import com.integrador.marweld.auth.application.command.ConfirmMfaCodeCommand;
import com.integrador.marweld.auth.application.command.MfaAuthenticatedCommand;
import com.integrador.marweld.auth.application.command.RegisterCommand;
import com.integrador.marweld.auth.application.command.ResendVerificationCodeCommand;
import com.integrador.marweld.auth.application.command.VerifyEmailCommand;
import com.integrador.marweld.auth.application.result.EmailMfaSetupResult;
import com.integrador.marweld.auth.application.result.EmailVerificationResult;
import com.integrador.marweld.auth.application.result.MfaMethodResult;
import com.integrador.marweld.auth.application.result.MfaStatusResult;
import com.integrador.marweld.auth.application.result.RegisterResult;
import com.integrador.marweld.auth.application.result.TotpSetupResult;

public interface AuthService {
    RegisterResult register(RegisterCommand command);
    EmailVerificationResult verifyEmail(VerifyEmailCommand command);
    EmailVerificationResult resendVerificationCode(ResendVerificationCodeCommand command);
    MfaStatusResult getMfaStatus(MfaAuthenticatedCommand command);
    TotpSetupResult startTotpSetup(MfaAuthenticatedCommand command);
    MfaMethodResult confirmTotpSetup(ConfirmMfaCodeCommand command);
    EmailMfaSetupResult startEmailMfaSetup(MfaAuthenticatedCommand command);
    MfaMethodResult confirmEmailMfaSetup(ConfirmMfaCodeCommand command);
}
