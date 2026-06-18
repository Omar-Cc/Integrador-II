package com.integrador.marweld.auth.api.controller;

import com.integrador.marweld.auth.api.mapper.AuthApiMapper;
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
import com.integrador.marweld.auth.application.service.AuthService;
import com.integrador.marweld.core.api.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Autenticación", description = "Endpoints para la gestión de usuarios, registro y validación de accesos.")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    private final AuthService authService;
    private final AuthApiMapper authApiMapper;

    public AuthController(AuthService authService, AuthApiMapper authApiMapper) {
        this.authService = authService;
        this.authApiMapper = authApiMapper;
    }

    @PostMapping("/register")
    @Operation(
        summary = "Registrar un nuevo cliente en el sistema",
        description = "Crea una cuenta para un cliente en estado pendiente de verificación de correo. Genera y envía un código OTP de 6 dígitos al correo electrónico provisto."
    )
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Cliente registrado correctamente. Cuenta pendiente de verificación.")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Datos de entrada inválidos o contraseña demasiado débil.")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "El correo electrónico o el documento de identidad ya se encuentran registrados.")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Error interno del servidor o fallo al entregar el correo electrónico de verificación.")
    public ResponseEntity<ApiResponse<RegisterResponse>> register(@Valid @RequestBody RegisterRequest request) {
        log.info("Recibida petición de registro de cliente con correo: {}", request.correo());
        
        RegisterCommand command = authApiMapper.toCommand(request);
        RegisterResult result = authService.register(command);
        RegisterResponse data = authApiMapper.toResponse(result);
        
        log.info("Registro de cliente procesado con éxito. UUID de Usuario: {}", data.userPublicId());
        
        ApiResponse<RegisterResponse> response = ApiResponse.success(
                "Cuenta creada correctamente. Revisa tu correo para validar tu cuenta.",
                data
        );
        
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    @PostMapping("/verify-email")
    @Operation(
        summary = "Verificar correo electronico con OTP",
        description = "Valida el codigo OTP enviado por correo y activa la cuenta del cliente si el codigo se encuentra vigente."
    )
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Correo verificado correctamente. Cuenta activada.")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Codigo invalido, expirado o datos de entrada invalidos.")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "No existe una cuenta registrada con el correo provisto.")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "La cuenta no se encuentra pendiente de verificacion.")
    public ResponseEntity<ApiResponse<EmailVerificationResponse>> verifyEmail(
            @Valid @RequestBody VerifyEmailRequest request) {
        log.info("Recibida peticion de verificacion de correo para: {}", request.correo());

        VerifyEmailCommand command = authApiMapper.toCommand(request);
        EmailVerificationResult result = authService.verifyEmail(command);
        EmailVerificationResponse data = authApiMapper.toResponse(result);

        ApiResponse<EmailVerificationResponse> response = ApiResponse.success(
                "Correo verificado correctamente. Tu cuenta ya se encuentra activa.",
                data
        );

        return ResponseEntity.ok(response);
    }

    @PostMapping("/resend-verification-code")
    @Operation(
        summary = "Reenviar codigo OTP de verificacion de correo",
        description = "Expira codigos pendientes anteriores y envia un nuevo codigo OTP de 6 digitos al correo del cliente."
    )
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Codigo de verificacion reenviado correctamente.")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Datos de entrada invalidos.")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "No existe una cuenta registrada con el correo provisto.")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "La cuenta no se encuentra pendiente de verificacion.")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Fallo al entregar el correo de verificacion.")
    public ResponseEntity<ApiResponse<EmailVerificationResponse>> resendVerificationCode(
            @Valid @RequestBody ResendVerificationCodeRequest request) {
        log.info("Recibida peticion de reenvio de codigo de verificacion para: {}", request.correo());

        ResendVerificationCodeCommand command = authApiMapper.toCommand(request);
        EmailVerificationResult result = authService.resendVerificationCode(command);
        EmailVerificationResponse data = authApiMapper.toResponse(result);

        ApiResponse<EmailVerificationResponse> response = ApiResponse.success(
                "Codigo de verificacion reenviado. Revisa tu correo para validar tu cuenta.",
                data
        );

        return ResponseEntity.ok(response);
    }
}
