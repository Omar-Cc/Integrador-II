package com.integrador.marweld.auth.application.service;

import com.integrador.marweld.auth.application.command.RegisterCommand;
import com.integrador.marweld.auth.application.command.ResendVerificationCodeCommand;
import com.integrador.marweld.auth.application.command.VerifyEmailCommand;
import com.integrador.marweld.auth.application.result.EmailVerificationResult;
import com.integrador.marweld.auth.application.result.RegisterResult;
import com.integrador.marweld.auth.application.usecase.ResendVerificationCodeUseCase;
import com.integrador.marweld.auth.application.usecase.RegisterClientUseCase;
import com.integrador.marweld.auth.application.usecase.VerifyEmailUseCase;
import com.integrador.marweld.auth.domain.exception.DocumentoAlreadyExistsException;
import com.integrador.marweld.auth.domain.exception.EmailAlreadyExistsException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthServiceImpl implements AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthServiceImpl.class);

    private final RegisterClientUseCase registerClientUseCase;
    private final VerifyEmailUseCase verifyEmailUseCase;
    private final ResendVerificationCodeUseCase resendVerificationCodeUseCase;

    public AuthServiceImpl(
            RegisterClientUseCase registerClientUseCase,
            VerifyEmailUseCase verifyEmailUseCase,
            ResendVerificationCodeUseCase resendVerificationCodeUseCase) {
        this.registerClientUseCase = registerClientUseCase;
        this.verifyEmailUseCase = verifyEmailUseCase;
        this.resendVerificationCodeUseCase = resendVerificationCodeUseCase;
    }

    @Override
    @Transactional
    public RegisterResult register(RegisterCommand command) {
        try {
            return registerClientUseCase.handle(command);
        } catch (DataIntegrityViolationException ex) {
            log.error("Violación de integridad de base de datos durante el registro del cliente: {}", ex.getMessage(), ex);
            
            String rootCauseMessage = ex.getRootCause() != null ? ex.getRootCause().getMessage() : "";
            
            if (rootCauseMessage.contains("usuarios_correo") || rootCauseMessage.contains("correo") || rootCauseMessage.contains("usuarios")) {
                throw new EmailAlreadyExistsException();
            }
            
            if (rootCauseMessage.contains("clientes_documento") || rootCauseMessage.contains("documento") || rootCauseMessage.contains("clientes")) {
                throw new DocumentoAlreadyExistsException();
            }
            
            throw ex;
        }
    }

    @Override
    @Transactional
    public EmailVerificationResult verifyEmail(VerifyEmailCommand command) {
        return verifyEmailUseCase.handle(command);
    }

    @Override
    @Transactional
    public EmailVerificationResult resendVerificationCode(ResendVerificationCodeCommand command) {
        return resendVerificationCodeUseCase.handle(command);
    }
}
