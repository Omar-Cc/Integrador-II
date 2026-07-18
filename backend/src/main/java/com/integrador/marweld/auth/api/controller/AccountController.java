package com.integrador.marweld.auth.api.controller;

import com.integrador.marweld.auth.api.response.AccountProfileResponse;
import com.integrador.marweld.auth.application.result.AccountProfileResult;
import com.integrador.marweld.auth.application.service.AuthService;
import com.integrador.marweld.core.api.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
        AccountProfileResponse data = new AccountProfileResponse(
                profile.userPublicId(), profile.nombre(), profile.correo(), profile.telefono(),
                profile.direccion(), profile.documento(), profile.fechaRegistro());
        return ResponseEntity.ok(ApiResponse.success("Perfil de cuenta obtenido correctamente.", data));
    }
}
