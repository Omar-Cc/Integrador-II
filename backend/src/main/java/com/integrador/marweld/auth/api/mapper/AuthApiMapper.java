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

@Component
public class AuthApiMapper {

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
