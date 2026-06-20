package com.integrador.marweld.auth.infrastructure.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.web.SecurityFilterChain;

import java.security.interfaces.RSAPublicKey;

/**
 * Security configuration setting up the OAuth2 Resource Server with asymmetric JWT decoding.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final AsymmetricJwtService jwtService;

    public SecurityConfig(AsymmetricJwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> {}) // Enable standard CORS defaults or configure separately
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/api/auth/register",
                                "/api/auth/verify-email",
                                "/api/auth/resend-verification-code",
                                "/api/auth/login",
                                "/api/auth/login/mfa/email/send",
                                "/api/auth/login/mfa/verify",
                                "/api/auth/refresh",
                                "/api/auth/logout",
                                "/error",
                                "/v3/api-docs/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html"
                        ).permitAll()
                        .requestMatchers("/api/storage/**").authenticated()
                        .anyRequest().authenticated()
                )
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwt -> jwt.decoder(jwtDecoder()))
                );

        return http.build();
    }

    @Bean
    public JwtDecoder jwtDecoder() {
        // Integrate Nimbus decoder using the RSA public key maintained by AsymmetricJwtService
        return NimbusJwtDecoder.withPublicKey((RSAPublicKey) jwtService.getPublicKey()).build();
    }
}
