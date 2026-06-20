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
import com.integrador.marweld.auth.application.command.LoginCommand;
import com.integrador.marweld.auth.application.command.MfaChallengeCommand;
import com.integrador.marweld.auth.application.command.VerifyLoginMfaCommand;
import com.integrador.marweld.auth.application.command.RefreshSessionCommand;
import com.integrador.marweld.auth.application.command.LogoutCommand;
import com.integrador.marweld.auth.application.result.AuthFlowResult;
import com.integrador.marweld.auth.application.result.MfaEmailSentResult;

public interface AuthService {
    RegisterResult register(RegisterCommand command);
    EmailVerificationResult verifyEmail(VerifyEmailCommand command);
    EmailVerificationResult resendVerificationCode(ResendVerificationCodeCommand command);
    MfaStatusResult getMfaStatus(MfaAuthenticatedCommand command);
    TotpSetupResult startTotpSetup(MfaAuthenticatedCommand command);
    MfaMethodResult confirmTotpSetup(ConfirmMfaCodeCommand command);
    EmailMfaSetupResult startEmailMfaSetup(MfaAuthenticatedCommand command);
    MfaMethodResult confirmEmailMfaSetup(ConfirmMfaCodeCommand command);
    AuthFlowResult login(LoginCommand command);
    MfaEmailSentResult sendLoginMfaEmail(MfaChallengeCommand command);
    AuthFlowResult verifyLoginMfa(VerifyLoginMfaCommand command);
    AuthFlowResult refresh(RefreshSessionCommand command);
    void logout(LogoutCommand command);
}
