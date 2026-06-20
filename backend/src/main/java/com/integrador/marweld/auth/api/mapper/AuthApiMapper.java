package com.integrador.marweld.auth.api.mapper;

import com.integrador.marweld.auth.api.request.RegisterRequest;
import com.integrador.marweld.auth.api.request.ResendVerificationCodeRequest;
import com.integrador.marweld.auth.api.request.VerifyEmailRequest;
import com.integrador.marweld.auth.api.response.EmailVerificationResponse;
import com.integrador.marweld.auth.api.response.RegisterResponse;
import com.integrador.marweld.auth.application.command.RegisterCommand;
import com.integrador.marweld.auth.application.command.ResendVerificationCodeCommand;
import com.integrador.marweld.auth.application.command.VerifyEmailCommand;
import com.integrador.marweld.auth.application.result.EmailVerificationResult;
import com.integrador.marweld.auth.application.result.RegisterResult;
import org.springframework.stereotype.Component;
import com.integrador.marweld.auth.api.request.*;
import com.integrador.marweld.auth.api.response.*;
import com.integrador.marweld.auth.application.command.*;
import com.integrador.marweld.auth.application.result.*;

@Component
public class AuthApiMapper {

    public LoginCommand toCommand(LoginRequest request, String ip, String userAgent) {
        return new LoginCommand(request.correo(), request.contrasena(), ip, userAgent);
    }

    public MfaChallengeCommand toCommand(MfaChallengeRequest request) {
        return new MfaChallengeCommand(request.challengePublicId());
    }

    public VerifyLoginMfaCommand toCommand(VerifyLoginMfaRequest request, String ip, String userAgent) {
        return new VerifyLoginMfaCommand(request.challengePublicId(), request.method(), request.codigo(), ip, userAgent);
    }

    public AuthFlowResponse toResponse(AuthFlowResult result) {
        AuthenticatedUserResponse user = result.user() == null ? null : new AuthenticatedUserResponse(
                result.user().userPublicId(), result.user().clientPublicId(), result.user().nombre(),
                result.user().correo(), result.user().rol());
        MfaChallengeResponse challenge = result.mfaChallenge() == null ? null : new MfaChallengeResponse(
                result.mfaChallenge().challengePublicId(), result.mfaChallenge().expiresAt(),
                result.mfaChallenge().availableMethods(), result.mfaChallenge().defaultMethod());
        return new AuthFlowResponse(result.status(), result.accessToken(), result.expiresInSeconds(), user, challenge);
    }

    public RegisterCommand toCommand(RegisterRequest request) {
        if (request == null) {
            return null;
        }
        return new RegisterCommand(
                request.nombre(),
                request.correo(),
                request.contrasena(),
                request.telefono(),
                request.documento(),
                request.direccion()
        );
    }

    public RegisterResponse toResponse(RegisterResult result) {
        if (result == null) {
            return null;
        }
        return new RegisterResponse(
                result.userPublicId(),
                result.clientPublicId(),
                result.nombre(),
                result.correo(),
                result.estado()
        );
    }

    public VerifyEmailCommand toCommand(VerifyEmailRequest request) {
        if (request == null) {
            return null;
        }
        return new VerifyEmailCommand(
                request.correo(),
                request.codigo()
        );
    }

    public ResendVerificationCodeCommand toCommand(ResendVerificationCodeRequest request) {
        if (request == null) {
            return null;
        }
        return new ResendVerificationCodeCommand(request.correo());
    }

    public EmailVerificationResponse toResponse(EmailVerificationResult result) {
        if (result == null) {
            return null;
        }
        return new EmailVerificationResponse(
                result.userPublicId(),
                result.correo(),
                result.estado()
        );
    }
}
