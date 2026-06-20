package com.integrador.marweld.admin.controller;

import com.integrador.marweld.auth.infrastructure.security.AsymmetricJwtService;
import com.integrador.marweld.auth.infrastructure.security.OtpService;
import com.integrador.marweld.auth.infrastructure.security.QrCodeService;
import com.integrador.marweld.notifications.application.service.EmailService;
import com.integrador.marweld.core.security.CloudflareIpResolver;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.context.annotation.Profile;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

/**
 * Controller to demonstrate and verify all added features:
 * Cloudflare IP resolution, asymmetric JWT generation & authentication,
 * TOTP OTP registration & verification, QR Code rendering, Resend email
 * dispatch, and email dispatch.
 */
@RestController
@RequestMapping("/api/demo")
@Profile("dev")
public class DemoController {

    private final AsymmetricJwtService jwtService;
    private final OtpService otpService;
    private final QrCodeService qrCodeService;
    private final EmailService emailService;

    public DemoController(AsymmetricJwtService jwtService,
            OtpService otpService,
            QrCodeService qrCodeService,
            EmailService emailService) {
        this.jwtService = jwtService;
        this.otpService = otpService;
        this.qrCodeService = qrCodeService;
        this.emailService = emailService;
    }

    /**
     * Resolves and returns the client IP address behind Cloudflare proxy.
     */
    @GetMapping("/cloudflare-ip")
    public ResponseEntity<Map<String, String>> getClientIp(HttpServletRequest request) {
        String clientIp = CloudflareIpResolver.getClientIp(request);
        Map<String, String> response = new HashMap<>();
        response.put("resolvedClientIp", clientIp);
        response.put("headerCfConnectingIp", request.getHeader("CF-Connecting-IP"));
        response.put("headerTrueClientIp", request.getHeader("True-Client-IP"));
        response.put("remoteAddr", request.getRemoteAddr());
        return ResponseEntity.ok(response);
    }

    /**
     * Generates a signed asymmetric JWT using RS256.
     */
    @PostMapping("/jwt/generate")
    public ResponseEntity<Map<String, String>> generateJwt(@RequestParam String username) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("roles", "ROLE_USER,ROLE_ADMIN");
        claims.put("auth_type", "asymmetric_rsa");

        String token = jwtService.generateToken(username, claims);
        Map<String, String> response = new HashMap<>();
        response.put("username", username);
        response.put("token", token);
        return ResponseEntity.ok(response);
    }

    /**
     * Manually validates a JWT using the AsymmetricJwtService public key.
     */
    @GetMapping("/jwt/validate-manual")
    public ResponseEntity<Map<String, Object>> validateJwtManual(@RequestParam String token) {
        try {
            var claims = jwtService.parseToken(token);
            Map<String, Object> response = new HashMap<>();
            response.put("valid", true);
            response.put("subject", claims.getSubject());
            response.put("issuer", claims.getIssuer());
            response.put("claims", claims);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("valid", false);
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * A secure endpoint protected by Spring Security's OAuth2 Resource Server.
     * Demonstrates that Spring Security successfully decodes and validates the
     * asymmetric JWT.
     */
    @GetMapping("/jwt/secure-resource")
    public ResponseEntity<Map<String, Object>> getSecureResource(@AuthenticationPrincipal Jwt jwt) {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Access granted to secure resource!");
        response.put("tokenSubject", jwt.getSubject());
        response.put("tokenClaims", jwt.getClaims());
        return ResponseEntity.ok(response);
    }

    /**
     * Sets up a TOTP secret and returns registration data, including a
     * Base64-encoded QR Code image.
     */
    @GetMapping("/totp/setup")
    public ResponseEntity<Map<String, String>> setupTotp(@RequestParam String email,
            @RequestParam(defaultValue = "Marweld") String issuer) {
        String secret = otpService.generateSecret();
        String otpauthUri = otpService.getOtpauthUri(secret, email, issuer);

        // Generate QR code bytes and encode as Base64 image
        byte[] qrCodeBytes = qrCodeService.generateQrCode(otpauthUri, 300, 300);
        String qrCodeBase64 = Base64.getEncoder().encodeToString(qrCodeBytes);
        String qrCodeDataUrl = "data:image/png;base64," + qrCodeBase64;

        Map<String, String> response = new HashMap<>();
        response.put("secret", secret);
        response.put("otpauthUri", otpauthUri);
        response.put("qrCodeDataUrl", qrCodeDataUrl);
        return ResponseEntity.ok(response);
    }

    /**
     * Verifies a user-supplied TOTP code.
     */
    @PostMapping("/totp/verify")
    public ResponseEntity<Map<String, Object>> verifyTotp(@RequestParam String secret, @RequestParam String code) {
        boolean isValid = otpService.verifyCode(secret, code);
        Map<String, Object> response = new HashMap<>();
        response.put("verified", isValid);
        return ResponseEntity.ok(response);
    }

    /**
     * Sends a demo email using the Resend email service.
     */
    @PostMapping("/email/send")
    public ResponseEntity<Map<String, String>> sendEmail(@RequestParam String to,
            @RequestParam String subject,
            @RequestParam String htmlContent) {
        String emailId = emailService.sendEmail(to, subject, htmlContent);
        Map<String, String> response = new HashMap<>();
        response.put("status", "Email sent request registered");
        response.put("emailId", emailId);
        return ResponseEntity.ok(response);
    }
}
