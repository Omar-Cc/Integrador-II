package com.integrador.marweld.auth.infrastructure.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.*;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;
import java.util.Date;
import java.util.Map;

/**
 * Service for managing asymmetric token signing and validation using RSA keys (RS256).
 * Automatically generates a temporary RSA KeyPair in memory if no credentials are configured.
 */
@Service
public class AsymmetricJwtService {

    private static final Logger log = LoggerFactory.getLogger(AsymmetricJwtService.class);

    @Value("${app.security.jwt.private-key:}")
    private String privateKeyPem;

    @Value("${app.security.jwt.public-key:}")
    private String publicKeyPem;

    @Value("${app.security.jwt.expiration-ms:3600000}")
    private long expirationMs = 3600000;

    @Value("${app.security.jwt.issuer:marweld-backend}")
    private String issuer = "marweld-backend";

    private PrivateKey privateKey;
    private PublicKey publicKey;

    @PostConstruct
    public void init() {
        try {
            boolean hasPrivate = privateKeyPem != null && !privateKeyPem.trim().isEmpty();
            boolean hasPublic = publicKeyPem != null && !publicKeyPem.trim().isEmpty();

            if (hasPrivate && hasPublic) {
                log.info("Loading configured asymmetric RSA keys from application properties.");
                this.privateKey = loadPrivateKey(privateKeyPem);
                this.publicKey = loadPublicKey(publicKeyPem);
            } else {
                log.warn("Asymmetric keys are not fully configured. Generating dynamic 2048-bit RSA key pair for local development.");
                KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance("RSA");
                keyPairGenerator.initialize(2048);
                KeyPair keyPair = keyPairGenerator.generateKeyPair();
                this.privateKey = keyPair.getPrivate();
                this.publicKey = keyPair.getPublic();
            }
        } catch (Exception e) {
            log.error("Failed to initialize cryptographic RSA keys: {}", e.getMessage(), e);
            throw new RuntimeException("Asymmetric keys initialization failed", e);
        }
    }

    /**
     * Retrieves the active public key.
     *
     * @return RSA Public Key.
     */
    public PublicKey getPublicKey() {
        return this.publicKey;
    }

    /**
     * Retrieves the active private key.
     *
     * @return RSA Private Key.
     */
    public PrivateKey getPrivateKey() {
        return this.privateKey;
    }

    /**
     * Generates a signed JWT for the given username with additional claim values.
     * Signs the token using the private key and RS256 algorithm.
     *
     * @param username    The subject identifier.
     * @param extraClaims Key-value pairs containing custom token claims.
     * @return Signed compact JWT string.
     */
    public String generateToken(String username, Map<String, Object> extraClaims) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expirationMs);

        return Jwts.builder()
                .subject(username)
                .claims(extraClaims)
                .issuer(issuer)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(privateKey, Jwts.SIG.RS256)
                .compact();
    }

    /**
     * Parses and validates a JWT signature using the public key.
     *
     * @param token Compact signed JWT string.
     * @return Extracted claims.
     */
    public Claims parseToken(String token) {
        return Jwts.parser()
                .verifyWith(publicKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private PrivateKey loadPrivateKey(String pem) throws Exception {
        String cleanPem = pem
                .replace("-----BEGIN PRIVATE KEY-----", "")
                .replace("-----END PRIVATE KEY-----", "")
                .replaceAll("\\s+", "");
        byte[] decoded = Base64.getDecoder().decode(cleanPem);
        PKCS8EncodedKeySpec spec = new PKCS8EncodedKeySpec(decoded);
        KeyFactory kf = KeyFactory.getInstance("RSA");
        return kf.generatePrivate(spec);
    }

    private PublicKey loadPublicKey(String pem) throws Exception {
        String cleanPem = pem
                .replace("-----BEGIN PUBLIC KEY-----", "")
                .replace("-----END PUBLIC KEY-----", "")
                .replaceAll("\\s+", "");
        byte[] decoded = Base64.getDecoder().decode(cleanPem);
        X509EncodedKeySpec spec = new X509EncodedKeySpec(decoded);
        KeyFactory kf = KeyFactory.getInstance("RSA");
        return kf.generatePublic(spec);
    }
}
