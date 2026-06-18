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
import com.integrador.marweld.auth.application.usecase.ConfirmEmailMfaSetupUseCase;
import com.integrador.marweld.auth.application.usecase.ConfirmTotpSetupUseCase;
import com.integrador.marweld.auth.application.usecase.GetMfaStatusUseCase;
import com.integrador.marweld.auth.application.usecase.ResendVerificationCodeUseCase;
import com.integrador.marweld.auth.application.usecase.RegisterClientUseCase;
import com.integrador.marweld.auth.application.usecase.StartEmailMfaSetupUseCase;
import com.integrador.marweld.auth.application.usecase.StartTotpSetupUseCase;
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
    private final GetMfaStatusUseCase getMfaStatusUseCase;
    private final StartTotpSetupUseCase startTotpSetupUseCase;
    private final ConfirmTotpSetupUseCase confirmTotpSetupUseCase;
    private final StartEmailMfaSetupUseCase startEmailMfaSetupUseCase;
    private final ConfirmEmailMfaSetupUseCase confirmEmailMfaSetupUseCase;

    public AuthServiceImpl(
            RegisterClientUseCase registerClientUseCase,
            VerifyEmailUseCase verifyEmailUseCase,
            ResendVerificationCodeUseCase resendVerificationCodeUseCase,
            GetMfaStatusUseCase getMfaStatusUseCase,
            StartTotpSetupUseCase startTotpSetupUseCase,
            ConfirmTotpSetupUseCase confirmTotpSetupUseCase,
            StartEmailMfaSetupUseCase startEmailMfaSetupUseCase,
            ConfirmEmailMfaSetupUseCase confirmEmailMfaSetupUseCase) {
        this.registerClientUseCase = registerClientUseCase;
        this.verifyEmailUseCase = verifyEmailUseCase;
        this.resendVerificationCodeUseCase = resendVerificationCodeUseCase;
        this.getMfaStatusUseCase = getMfaStatusUseCase;
        this.startTotpSetupUseCase = startTotpSetupUseCase;
        this.confirmTotpSetupUseCase = confirmTotpSetupUseCase;
        this.startEmailMfaSetupUseCase = startEmailMfaSetupUseCase;
        this.confirmEmailMfaSetupUseCase = confirmEmailMfaSetupUseCase;
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

    @Override
    @Transactional(readOnly = true)
    public MfaStatusResult getMfaStatus(MfaAuthenticatedCommand command) {
        return getMfaStatusUseCase.getMfaStatus(command);
    }

    @Override
    @Transactional
    public TotpSetupResult startTotpSetup(MfaAuthenticatedCommand command) {
        return startTotpSetupUseCase.startTotpSetup(command);
    }

    @Override
    @Transactional
    public MfaMethodResult confirmTotpSetup(ConfirmMfaCodeCommand command) {
        return confirmTotpSetupUseCase.confirmTotpSetup(command);
    }

    @Override
    @Transactional
    public EmailMfaSetupResult startEmailMfaSetup(MfaAuthenticatedCommand command) {
        return startEmailMfaSetupUseCase.startEmailMfaSetup(command);
    }

    @Override
    @Transactional
    public MfaMethodResult confirmEmailMfaSetup(ConfirmMfaCodeCommand command) {
        return confirmEmailMfaSetupUseCase.confirmEmailMfaSetup(command);
    }
}
