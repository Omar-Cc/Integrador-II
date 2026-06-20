package com.integrador.marweld.auth.infrastructure.security;

import com.bastiaanjansen.otp.HMACAlgorithm;
import com.bastiaanjansen.otp.TOTPGenerator;
import com.bastiaanjansen.otp.SecretGenerator;
import org.apache.commons.codec.binary.Base32;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.time.Duration;

/**
 * Service for managing Multi-Factor Authentication (MFA) via One-Time Passwords (TOTP).
 * Uses otp-java library to generate/verify TOTP codes and construct enrollment URIs.
 */
@Service
public class OtpService {

    private static final Logger log = LoggerFactory.getLogger(OtpService.class);
    private final Base32 base32 = new Base32();

    /**
     * Generates a cryptographically secure random secret key in Base32 format.
     * This secret is shared between the server and the authenticator application.
     *
     * @return Base32 encoded shared secret string.
     */
    public String generateSecret() {
        log.info("Generating a new secure TOTP shared secret.");
        // By default, generates a 160-bit (20 bytes) secret
        byte[] secretBytes = SecretGenerator.generate();
        return base32.encodeAsString(secretBytes).trim();
    }

    /**
     * Generates the current TOTP password code for the provided secret key.
     *
     * @param secretBase32 Base32 encoded shared secret.
     * @return Current 6-digit TOTP code.
     */
    public String generateCurrentCode(String secretBase32) {
        byte[] secretBytes = base32.decode(secretBase32);
        TOTPGenerator totp = new TOTPGenerator.Builder(secretBytes)
                .withHOTPGenerator(builder -> builder
                        .withAlgorithm(HMACAlgorithm.SHA1)
                        .withPasswordLength(6))
                .withPeriod(Duration.ofSeconds(30))
                .build();
        return totp.now();
    }

    /**
     * Verifies if a user-supplied code is valid for the current time step.
     *
     * @param secretBase32 Base32 encoded shared secret.
     * @param code         6-digit user-supplied OTP code.
     * @return True if valid, false if invalid or expired.
     */
    public boolean verifyCode(String secretBase32, String code) {
        log.info("Verifying TOTP code entry.");
        try {
            byte[] secretBytes = base32.decode(secretBase32);
            TOTPGenerator totp = new TOTPGenerator.Builder(secretBytes)
                    .withHOTPGenerator(builder -> builder
                            .withAlgorithm(HMACAlgorithm.SHA1)
                            .withPasswordLength(6))
                    .withPeriod(Duration.ofSeconds(30))
                    .build();
            return totp.verify(code);
        } catch (Exception e) {
            log.error("Error encountered while verifying TOTP code: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Generates the 'otpauth://' URI to register in an authenticator app (Google Authenticator, Authy, etc.).
     *
     * @param secretBase32 Base32 encoded shared secret.
     * @param accountName  Email or username of the account.
     * @param issuer       Name of the system issuing the token.
     * @return String URI formatted in accordance with Google Authenticator URI specification.
     */
    public String getOtpauthUri(String secretBase32, String accountName, String issuer) {
        try {
            byte[] secretBytes = base32.decode(secretBase32);
            TOTPGenerator totp = new TOTPGenerator.Builder(secretBytes)
                    .withHOTPGenerator(builder -> builder
                            .withAlgorithm(HMACAlgorithm.SHA1)
                            .withPasswordLength(6))
                    .withPeriod(Duration.ofSeconds(30))
                    .build();
            URI uri = totp.getURI(issuer, accountName);
            return uri.toString();
        } catch (Exception e) {
            log.error("Failed to generate OTP auth URI: {}", e.getMessage(), e);
            throw new RuntimeException("OTP Auth URI generation failure", e);
        }
    }
}
