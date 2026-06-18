package com.integrador.marweld.auth.api.mapper;

import com.integrador.marweld.auth.api.request.ConfirmMfaCodeRequest;
import com.integrador.marweld.auth.api.response.EmailMfaSetupResponse;
import com.integrador.marweld.auth.api.response.MfaMethodResponse;
import com.integrador.marweld.auth.api.response.MfaStatusResponse;
import com.integrador.marweld.auth.api.response.TotpSetupResponse;
import com.integrador.marweld.auth.application.command.ConfirmMfaCodeCommand;
import com.integrador.marweld.auth.application.command.MfaAuthenticatedCommand;
import com.integrador.marweld.auth.application.result.EmailMfaSetupResult;
import com.integrador.marweld.auth.application.result.MfaMethodResult;
import com.integrador.marweld.auth.application.result.MfaStatusResult;
import com.integrador.marweld.auth.application.result.TotpSetupResult;
import org.springframework.stereotype.Component;

@Component
public class MfaApiMapper {

    public MfaAuthenticatedCommand toAuthenticatedCommand(String correo) {
        return new MfaAuthenticatedCommand(correo);
    }

    public ConfirmMfaCodeCommand toConfirmCommand(String correo, ConfirmMfaCodeRequest request) {
        return new ConfirmMfaCodeCommand(correo, request.codigo());
    }

    public MfaStatusResponse toResponse(MfaStatusResult result) {
        return new MfaStatusResponse(result.totpEnabled(), result.emailOtpEnabled());
    }

    public TotpSetupResponse toResponse(TotpSetupResult result) {
        return new TotpSetupResponse(result.otpauthUri(), result.qrCodeDataUrl(), result.estado());
    }

    public MfaMethodResponse toResponse(MfaMethodResult result) {
        return new MfaMethodResponse(result.metodo(), result.estado());
    }

    public EmailMfaSetupResponse toResponse(EmailMfaSetupResult result) {
        return new EmailMfaSetupResponse(result.metodo(), result.estado(), result.fechaExpiracion());
    }
}
