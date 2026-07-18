package com.integrador.marweld.auth.api.controller;

import com.integrador.marweld.auth.api.response.AccountProfileResponse;
import com.integrador.marweld.auth.api.request.UpdateAccountProfileRequest;
import com.integrador.marweld.auth.application.command.UpdateAccountProfileCommand;
import com.integrador.marweld.auth.application.result.AccountProfileResult;
import com.integrador.marweld.auth.application.service.AuthService;
import com.integrador.marweld.core.api.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/me")
public class AccountController {
    private final AuthService authService;

    public AccountController(AuthService authService) {
        this.authService = authService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<AccountProfileResponse>> getProfile(@AuthenticationPrincipal Jwt jwt) {
        AccountProfileResult profile = authService.getAccountProfile(jwt.getSubject());
        AccountProfileResponse data = toResponse(profile);
        return ResponseEntity.ok(ApiResponse.success("Perfil de cuenta obtenido correctamente.", data));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<AccountProfileResponse>> updateProfile(
            @AuthenticationPrincipal Jwt jwt, @Valid @RequestBody UpdateAccountProfileRequest request) {
        AccountProfileResult profile = authService.updateAccountProfile(jwt.getSubject(),
                new UpdateAccountProfileCommand(request.nombre(), request.telefono(), request.direccion()));
        return ResponseEntity.ok(ApiResponse.success("Perfil actualizado correctamente.", toResponse(profile)));
    }

    private static AccountProfileResponse toResponse(AccountProfileResult profile) {
        return new AccountProfileResponse(profile.userPublicId(), profile.nombre(), profile.correo(), profile.telefono(),
                profile.direccion(), profile.documento(), profile.fechaRegistro());
    }
}
