package com.integrador.marweld;

import com.integrador.marweld.auth.infrastructure.security.AsymmetricJwtService;
import com.integrador.marweld.auth.infrastructure.security.OtpService;
import com.integrador.marweld.auth.infrastructure.security.QrCodeService;
import com.integrador.marweld.core.security.CloudflareIpResolver;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.HashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

/**
 * Unit tests verifying JWT signing, TOTP generation/verification,
 * QR code rendering, and Cloudflare IP resolution.
 */
class MarweldServicesTests {

    private AsymmetricJwtService jwtService;
    private OtpService otpService;
    private QrCodeService qrCodeService;

    @BeforeEach
    void setUp() {
        jwtService = new AsymmetricJwtService();
        // Trigger manual lifecycle initialization for unit test
        jwtService.init();

        otpService = new OtpService();
        qrCodeService = new QrCodeService();
    }

    @Test
    void testAsymmetricJwtSigningAndParsing() {
        String username = "testuser";
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", "admin");

        String token = jwtService.generateToken(username, claims);
        assertThat(token).isNotBlank();

        Claims parsedClaims = jwtService.parseToken(token);
        assertThat(parsedClaims.getSubject()).isEqualTo(username);
        assertThat(parsedClaims.get("role")).isEqualTo("admin");
    }

    @Test
    void testOtpGenerationAndVerification() {
        String secret = otpService.generateSecret();
        assertThat(secret).isNotBlank();

        String code = otpService.generateCurrentCode(secret);
        assertThat(code).hasSize(6);

        boolean isValid = otpService.verifyCode(secret, code);
        assertThat(isValid).isTrue();

        String otpauthUri = otpService.getOtpauthUri(secret, "user@example.com", "TestIssuer");
        assertThat(otpauthUri).contains("otpauth://totp/TestIssuer:user%40example.com");
    }

    @Test
    void testQrCodeGeneration() {
        byte[] qrBytes = qrCodeService.generateQrCode("https://github.com", 200, 200);
        assertThat(qrBytes).isNotEmpty();
    }

    @Test
    void testCloudflareIpResolver() {
        HttpServletRequest request = Mockito.mock(HttpServletRequest.class);

        // Case 1: CF-Connecting-IP exists
        when(request.getHeader("CF-Connecting-IP")).thenReturn("203.0.113.195");
        String ip = CloudflareIpResolver.getClientIp(request);
        assertThat(ip).isEqualTo("203.0.113.195");

        // Case 2: True-Client-IP exists, CF-Connecting-IP is null
        when(request.getHeader("CF-Connecting-IP")).thenReturn(null);
        when(request.getHeader("True-Client-IP")).thenReturn("203.0.113.196");
        ip = CloudflareIpResolver.getClientIp(request);
        assertThat(ip).isEqualTo("203.0.113.196");

        // Case 3: X-Forwarded-For exists, others null
        when(request.getHeader("True-Client-IP")).thenReturn(null);
        when(request.getHeader("X-Forwarded-For")).thenReturn("203.0.113.197, 192.168.1.1");
        ip = CloudflareIpResolver.getClientIp(request);
        assertThat(ip).isEqualTo("203.0.113.197");

        // Case 4: Default remote address
        when(request.getHeader("X-Forwarded-For")).thenReturn(null);
        when(request.getRemoteAddr()).thenReturn("127.0.0.1");
        ip = CloudflareIpResolver.getClientIp(request);
        assertThat(ip).isEqualTo("127.0.0.1");
    }
}
