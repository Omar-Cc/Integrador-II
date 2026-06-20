package com.integrador.marweld.auth.application.usecase;

import com.integrador.marweld.auth.application.command.*;
import com.integrador.marweld.auth.application.result.*;

public interface AuthSessionUseCase {
    AuthFlowResult login(LoginCommand command);
    MfaEmailSentResult sendLoginMfaEmail(MfaChallengeCommand command);
    AuthFlowResult verifyLoginMfa(VerifyLoginMfaCommand command);
    AuthFlowResult refresh(RefreshSessionCommand command);
    void logout(LogoutCommand command);
}
