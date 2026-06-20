package com.integrador.marweld.auth.api.controller;

import com.integrador.marweld.auth.api.mapper.MfaApiMapper;
import com.integrador.marweld.auth.api.request.ConfirmMfaCodeRequest;
import com.integrador.marweld.auth.api.response.EmailMfaSetupResponse;
import com.integrador.marweld.auth.api.response.MfaMethodResponse;
import com.integrador.marweld.auth.api.response.MfaStatusResponse;
import com.integrador.marweld.auth.api.response.TotpSetupResponse;
import com.integrador.marweld.auth.application.service.AuthService;
import com.integrador.marweld.core.api.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/me/2fa")
public class MfaController {

    private final AuthService authService;
    private final MfaApiMapper mfaApiMapper;

    public MfaController(AuthService authService, MfaApiMapper mfaApiMapper) {
        this.authService = authService;
        this.mfaApiMapper = mfaApiMapper;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<MfaStatusResponse>> getStatus(@AuthenticationPrincipal Jwt jwt) {
        MfaStatusResponse data = mfaApiMapper.toResponse(
                authService.getMfaStatus(mfaApiMapper.toAuthenticatedCommand(jwt.getSubject()))
        );
        return ResponseEntity.ok(ApiResponse.success("Estado 2FA obtenido correctamente.", data));
    }

    @PostMapping("/totp/setup")
    public ResponseEntity<ApiResponse<TotpSetupResponse>> startTotpSetup(@AuthenticationPrincipal Jwt jwt) {
        TotpSetupResponse data = mfaApiMapper.toResponse(
                authService.startTotpSetup(mfaApiMapper.toAuthenticatedCommand(jwt.getSubject()))
        );
        return ResponseEntity.ok(ApiResponse.success("Enrolamiento TOTP iniciado correctamente.", data));
    }

    @PostMapping("/totp/confirm")
    public ResponseEntity<ApiResponse<MfaMethodResponse>> confirmTotpSetup(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody ConfirmMfaCodeRequest request) {
        MfaMethodResponse data = mfaApiMapper.toResponse(
                authService.confirmTotpSetup(mfaApiMapper.toConfirmCommand(jwt.getSubject(), request))
        );
        return ResponseEntity.ok(ApiResponse.success("Metodo TOTP activado correctamente.", data));
    }

    @PostMapping("/email/setup")
    public ResponseEntity<ApiResponse<EmailMfaSetupResponse>> startEmailSetup(@AuthenticationPrincipal Jwt jwt) {
        EmailMfaSetupResponse data = mfaApiMapper.toResponse(
                authService.startEmailMfaSetup(mfaApiMapper.toAuthenticatedCommand(jwt.getSubject()))
        );
        return ResponseEntity.ok(ApiResponse.success("Codigo 2FA por correo enviado correctamente.", data));
    }

    @PostMapping("/email/confirm")
    public ResponseEntity<ApiResponse<MfaMethodResponse>> confirmEmailSetup(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody ConfirmMfaCodeRequest request) {
        MfaMethodResponse data = mfaApiMapper.toResponse(
                authService.confirmEmailMfaSetup(mfaApiMapper.toConfirmCommand(jwt.getSubject(), request))
        );
        return ResponseEntity.ok(ApiResponse.success("Metodo EMAIL_OTP activado correctamente.", data));
    }
}
