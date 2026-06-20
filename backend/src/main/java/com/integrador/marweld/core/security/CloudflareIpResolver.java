package com.integrador.marweld.core.security;

import jakarta.servlet.http.HttpServletRequest;

/**
 * Utility to extract the actual client IP address when the application is running behind Cloudflare proxies.
 */
public class CloudflareIpResolver {

    private CloudflareIpResolver() {
        // Private constructor to prevent instantiation of utility class
    }

    /**
     * Resolves the client's original IP address by inspecting Cloudflare headers
     * (`CF-Connecting-IP` and `True-Client-IP`) before checking default headers and remote address.
     *
     * @param request The current HttpServletRequest.
     * @return The client's IP address.
     */
    public static String getClientIp(HttpServletRequest request) {
        if (request == null) {
            return "unknown";
        }

        // 1. Check Cloudflare Primary Client IP header
        String cfConnectingIp = request.getHeader("CF-Connecting-IP");
        if (cfConnectingIp != null && !cfConnectingIp.trim().isEmpty()) {
            return cfConnectingIp.trim();
        }

        // 2. Check Cloudflare Alternative Client IP header
        String trueClientIp = request.getHeader("True-Client-IP");
        if (trueClientIp != null && !trueClientIp.trim().isEmpty()) {
            return trueClientIp.trim();
        }

        // 3. Check general forward proxies (X-Forwarded-For)
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.trim().isEmpty()) {
            // The first element in X-Forwarded-For contains the original client IP
            return xForwardedFor.split(",")[0].trim();
        }

        // 4. Default fallback to socket client remote address
        return request.getRemoteAddr();
    }
}
