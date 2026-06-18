package com.integrador.marweld.storage.dto;

import java.time.Instant;
import java.util.List;
import java.util.Map;

/**
 * Data returned after generating a Cloudflare R2 signed URL.
 */
public record PresignedStorageUrl(
        String objectKey,
        String url,
        String method,
        Instant expiresAt,
        Map<String, List<String>> headers
) {
}
