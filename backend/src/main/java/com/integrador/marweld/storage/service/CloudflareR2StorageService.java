package com.integrador.marweld.storage.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.integrador.marweld.storage.config.R2StorageProperties;
import com.integrador.marweld.storage.dto.PresignedStorageUrl;

import software.amazon.awssdk.core.ResponseBytes;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

import java.net.URL;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;

/**
 * Service implementation for file operations using Cloudflare R2 Object Storage (via AWS S3 compatibility API).
 */
@Service
public class CloudflareR2StorageService implements FileStorageService {

    private static final Logger log = LoggerFactory.getLogger(CloudflareR2StorageService.class);
    private final S3Client s3Client;
    private final S3Presigner s3Presigner;
    private final R2StorageProperties properties;

    public CloudflareR2StorageService(S3Client s3Client, S3Presigner s3Presigner, R2StorageProperties properties) {
        this.s3Client = s3Client;
        this.s3Presigner = s3Presigner;
        this.properties = properties;
    }

    @Override
    public String uploadFile(String bucketName, String objectKey, byte[] content, String contentType) {
        log.info("Uploading file to Cloudflare R2. Bucket: {}, Key: {}, Content-Type: {}", bucketName, objectKey, contentType);
        try {
            PutObjectRequest putRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(objectKey)
                    .contentType(contentType)
                    .build();
            s3Client.putObject(putRequest, RequestBody.fromBytes(content));

            String url;
            if (properties.hasPublicUrlPrefix()) {
                url = String.format("%s/%s", properties.publicUrlPrefix().replaceAll("/$", ""), objectKey);
            } else {
                url = String.format("r2://%s/%s", bucketName, objectKey);
            }
            log.info("Cloudflare R2 upload complete. URL: {}", url);
            return url;
        } catch (Exception e) {
            log.error("Failed to upload file to Cloudflare R2: {}", e.getMessage(), e);
            throw new RuntimeException("Cloudflare R2 storage upload failure: " + e.getMessage(), e);
        }
    }

    @Override
    public byte[] downloadFile(String bucketName, String objectKey) {
        log.info("Downloading file from Cloudflare R2. Bucket: {}, Key: {}", bucketName, objectKey);
        try {
            GetObjectRequest getRequest = GetObjectRequest.builder()
                    .bucket(bucketName)
                    .key(objectKey)
                    .build();
            ResponseBytes<GetObjectResponse> objectBytes = s3Client.getObjectAsBytes(getRequest);
            return objectBytes.asByteArray();
        } catch (Exception e) {
            log.error("Failed to download file from Cloudflare R2: {}", e.getMessage(), e);
            throw new RuntimeException("Cloudflare R2 storage download failure: " + e.getMessage(), e);
        }
    }

    @Override
    public void deleteFile(String bucketName, String objectKey) {
        log.info("Deleting file from Cloudflare R2. Bucket: {}, Key: {}", bucketName, objectKey);
        try {
            DeleteObjectRequest deleteRequest = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(objectKey)
                    .build();
            s3Client.deleteObject(deleteRequest);
            log.info("Successfully deleted file from Cloudflare R2.");
        } catch (Exception e) {
            log.error("Failed to delete file from Cloudflare R2: {}", e.getMessage(), e);
            throw new RuntimeException("Cloudflare R2 storage deletion failure: " + e.getMessage(), e);
        }
    }

    public String uploadBytes(String objectKey, byte[] content, String contentType) {
        return uploadFile(properties.bucketName(), objectKey, content, contentType);
    }

    public byte[] downloadBytes(String objectKey) {
        return downloadFile(properties.bucketName(), objectKey);
    }

    public void delete(String objectKey) {
        deleteFile(properties.bucketName(), objectKey);
    }

    public PresignedStorageUrl createPresignedUpload(String objectKey, String contentType) {
        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(properties.bucketName())
                .key(objectKey)
                .contentType(contentType)
                .build();
        PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
                .signatureDuration(signedUrlDuration())
                .putObjectRequest(putObjectRequest)
                .build();
        PresignedPutObjectRequest presignedRequest = s3Presigner.presignPutObject(presignRequest);
        return toStorageUrl(objectKey, "PUT", presignedRequest.url(), presignedRequest.signedHeaders());
    }

    public PresignedStorageUrl createPresignedDownload(String objectKey) {
        GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                .bucket(properties.bucketName())
                .key(objectKey)
                .build();
        GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                .signatureDuration(signedUrlDuration())
                .getObjectRequest(getObjectRequest)
                .build();
        PresignedGetObjectRequest presignedRequest = s3Presigner.presignGetObject(presignRequest);
        return toStorageUrl(objectKey, "GET", presignedRequest.url(), presignedRequest.signedHeaders());
    }

    private PresignedStorageUrl toStorageUrl(String objectKey, String method, URL url, Map<String, java.util.List<String>> headers) {
        return new PresignedStorageUrl(
                objectKey,
                url.toString(),
                method,
                Instant.now().plus(signedUrlDuration()),
                headers
        );
    }

    private Duration signedUrlDuration() {
        return Duration.ofSeconds(properties.signedUrlTtlSeconds());
    }
}
