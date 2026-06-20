package com.integrador.marweld.auth.api;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;
import java.time.Duration;

@Component
public class AuthCookieFactory {
    public static final String COOKIE_NAME = "marweld_refresh_token";
    private final boolean secure;
    private final long ttlDays;

    public AuthCookieFactory(@Value("${app.security.refresh-token.secure:false}") boolean secure,
                             @Value("${app.security.refresh-token.ttl-days:30}") long ttlDays) {
        this.secure = secure;
        this.ttlDays = ttlDays;
    }

    public ResponseCookie create(String token) {
        return base(token).maxAge(Duration.ofDays(ttlDays)).build();
    }

    public ResponseCookie clear() {
        return base("").maxAge(Duration.ZERO).build();
    }

    private ResponseCookie.ResponseCookieBuilder base(String value) {
        return ResponseCookie.from(COOKIE_NAME, value)
                .httpOnly(true).secure(secure).sameSite("Lax").path("/api/auth");
    }
}
