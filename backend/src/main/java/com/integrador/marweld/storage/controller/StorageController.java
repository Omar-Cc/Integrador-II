package com.integrador.marweld.storage.controller;

import com.integrador.marweld.storage.dto.PresignedStorageUrl;
import com.integrador.marweld.storage.service.CloudflareR2StorageService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.validation.annotation.Validated;

import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import java.util.UUID;

/**
 * Authenticated API for Cloudflare R2 object uploads and signed URL generation.
 */
@RestController
@RequestMapping("/api/storage")
@Validated
public class StorageController {

    private static final DateTimeFormatter YEAR_FORMATTER = DateTimeFormatter.ofPattern("yyyy");
    private static final DateTimeFormatter MONTH_FORMATTER = DateTimeFormatter.ofPattern("MM");
    private static final long MAX_UPLOAD_LENGTH_BYTES = 25L * 1024L * 1024L;

    private final CloudflareR2StorageService storageService;

    public StorageController(CloudflareR2StorageService storageService) {
        this.storageService = storageService;
    }

    @PostMapping("/uploads/presign")
    public ResponseEntity<PresignedUploadResponse> createPresignedUpload(@Valid @RequestBody PresignedUploadRequest request) {
        String objectKey = generateObjectKey(request.filename());
        PresignedStorageUrl signedUrl = storageService.createPresignedUpload(objectKey, request.contentType());
        return ResponseEntity.ok(PresignedUploadResponse.from(signedUrl));
    }

    @GetMapping("/downloads/presign")
    public ResponseEntity<PresignedDownloadResponse> createPresignedDownload(@RequestParam @NotBlank String objectKey) {
        PresignedStorageUrl signedUrl = storageService.createPresignedDownload(objectKey);
        return ResponseEntity.ok(PresignedDownloadResponse.from(signedUrl));
    }

    @PostMapping(value = "/files", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UploadedFileResponse> uploadFile(@RequestPart MultipartFile file) throws IOException {
        String objectKey = generateObjectKey(file.getOriginalFilename());
        String contentType = file.getContentType() == null ? MediaType.APPLICATION_OCTET_STREAM_VALUE : file.getContentType();
        String url = storageService.uploadBytes(objectKey, file.getBytes(), contentType);
        return ResponseEntity.ok(new UploadedFileResponse(objectKey, url));
    }

    private String generateObjectKey(String filename) {
        LocalDate today = LocalDate.now();
        return "uploads/%s/%s/%s-%s".formatted(
                YEAR_FORMATTER.format(today),
                MONTH_FORMATTER.format(today),
                UUID.randomUUID(),
                sanitizeFilename(filename)
        );
    }

    private String sanitizeFilename(String filename) {
        String fallback = "file";
        if (filename == null || filename.isBlank()) {
            return fallback;
        }

        String onlyName = filename.replace("\\", "/");
        int slashIndex = onlyName.lastIndexOf('/');
        if (slashIndex >= 0) {
            onlyName = onlyName.substring(slashIndex + 1);
        }

        String sanitized = onlyName.toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9._-]", "-")
                .replaceAll("-+", "-")
                .replaceAll("(^[.-]+|[.-]+$)", "");
        return sanitized.isBlank() ? fallback : sanitized;
    }

    public record PresignedUploadRequest(
            @NotBlank String filename,
            @NotBlank String contentType,
            @Min(1) @Max(MAX_UPLOAD_LENGTH_BYTES) long contentLength
    ) {
    }

    public record PresignedUploadResponse(
            String objectKey,
            String uploadUrl,
            String method,
            java.time.Instant expiresAt,
            java.util.Map<String, java.util.List<String>> headers
    ) {

        private static PresignedUploadResponse from(PresignedStorageUrl signedUrl) {
            return new PresignedUploadResponse(
                    signedUrl.objectKey(),
                    signedUrl.url(),
                    signedUrl.method(),
                    signedUrl.expiresAt(),
                    signedUrl.headers()
            );
        }
    }

    public record PresignedDownloadResponse(
            String objectKey,
            String downloadUrl,
            String method,
            java.time.Instant expiresAt,
            java.util.Map<String, java.util.List<String>> headers
    ) {

        private static PresignedDownloadResponse from(PresignedStorageUrl signedUrl) {
            return new PresignedDownloadResponse(
                    signedUrl.objectKey(),
                    signedUrl.url(),
                    signedUrl.method(),
                    signedUrl.expiresAt(),
                    signedUrl.headers()
            );
        }
    }

    public record UploadedFileResponse(String objectKey, String url) {
    }
}
