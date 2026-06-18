package com.integrador.marweld.storage.config;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

/**
 * Type-safe configuration for Cloudflare R2 storage.
 */
@Validated
@ConfigurationProperties(prefix = "app.storage.cloudflare")
public record R2StorageProperties(
        @NotBlank String bucketName,
        @NotBlank String endpoint,
        @NotBlank String accessKey,
        @NotBlank String secretKey,
        String publicUrlPrefix,
        @Min(60) long signedUrlTtlSeconds
) {

    private static final long DEFAULT_SIGNED_URL_TTL_SECONDS = 900;

    public R2StorageProperties {
        if (signedUrlTtlSeconds == 0) {
            signedUrlTtlSeconds = DEFAULT_SIGNED_URL_TTL_SECONDS;
        }
    }

    public boolean hasPublicUrlPrefix() {
        return publicUrlPrefix != null && !publicUrlPrefix.isBlank();
    }

    public boolean isUsingMockEndpoint() {
        return endpoint == null || endpoint.isBlank() || endpoint.contains("mock-account-id");
    }
}
