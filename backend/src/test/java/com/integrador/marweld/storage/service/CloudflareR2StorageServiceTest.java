package com.integrador.marweld.storage.service;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import com.integrador.marweld.storage.config.R2StorageProperties;
import com.integrador.marweld.storage.dto.PresignedStorageUrl;

import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.DeleteObjectResponse;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectResponse;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

import java.net.URI;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class CloudflareR2StorageServiceTest {

    private static final String BUCKET_NAME = "marweld-test-bucket";

    private S3Client s3Client;
    private S3Presigner s3Presigner;
    private CloudflareR2StorageService storageService;

    @BeforeEach
    void setUp() {
        s3Client = mock(S3Client.class);
        s3Presigner = S3Presigner.builder()
                .endpointOverride(URI.create("https://example-account.r2.cloudflarestorage.com"))
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create("test-access-key", "test-secret-key")
                ))
                .region(Region.US_EAST_1)
                .build();
        R2StorageProperties properties = new R2StorageProperties(
                BUCKET_NAME,
                "https://example-account.r2.cloudflarestorage.com",
                "test-access-key",
                "test-secret-key",
                "https://cdn.marweld.test",
                900
        );
        storageService = new CloudflareR2StorageService(s3Client, s3Presigner, properties);
    }

    @AfterEach
    void tearDown() {
        s3Presigner.close();
    }

    @Test
    void uploadBytesSendsPutObjectToConfiguredBucket() {
        when(s3Client.putObject(any(PutObjectRequest.class), any(RequestBody.class)))
                .thenReturn(PutObjectResponse.builder().build());

        String url = storageService.uploadBytes("uploads/2026/06/file.pdf", new byte[]{1, 2, 3}, "application/pdf");

        ArgumentCaptor<PutObjectRequest> requestCaptor = ArgumentCaptor.forClass(PutObjectRequest.class);
        verify(s3Client).putObject(requestCaptor.capture(), any(RequestBody.class));
        PutObjectRequest request = requestCaptor.getValue();
        assertThat(request.bucket()).isEqualTo(BUCKET_NAME);
        assertThat(request.key()).isEqualTo("uploads/2026/06/file.pdf");
        assertThat(request.contentType()).isEqualTo("application/pdf");
        assertThat(url).isEqualTo("https://cdn.marweld.test/uploads/2026/06/file.pdf");
    }

    @Test
    void uploadBytesReturnsStorageUriWhenPublicPrefixIsNotConfigured() {
        when(s3Client.putObject(any(PutObjectRequest.class), any(RequestBody.class)))
                .thenReturn(PutObjectResponse.builder().build());
        R2StorageProperties properties = new R2StorageProperties(
                BUCKET_NAME,
                "https://example-account.r2.cloudflarestorage.com",
                "test-access-key",
                "test-secret-key",
                "",
                900
        );
        CloudflareR2StorageService privateStorageService = new CloudflareR2StorageService(s3Client, s3Presigner, properties);

        String url = privateStorageService.uploadBytes("uploads/2026/06/file.pdf", new byte[]{1, 2, 3}, "application/pdf");

        assertThat(url).isEqualTo("r2://marweld-test-bucket/uploads/2026/06/file.pdf");
    }

    @Test
    void deleteUsesConfiguredBucket() {
        when(s3Client.deleteObject(any(DeleteObjectRequest.class)))
                .thenReturn(DeleteObjectResponse.builder().build());

        storageService.delete("uploads/2026/06/file.pdf");

        ArgumentCaptor<DeleteObjectRequest> requestCaptor = ArgumentCaptor.forClass(DeleteObjectRequest.class);
        verify(s3Client).deleteObject(requestCaptor.capture());
        DeleteObjectRequest request = requestCaptor.getValue();
        assertThat(request.bucket()).isEqualTo(BUCKET_NAME);
        assertThat(request.key()).isEqualTo("uploads/2026/06/file.pdf");
    }

    @Test
    void createPresignedUploadReturnsPutUrlForConfiguredBucketAndKey() {
        PresignedStorageUrl signedUrl = storageService.createPresignedUpload("uploads/2026/06/file.pdf", "application/pdf");

        assertThat(signedUrl.objectKey()).isEqualTo("uploads/2026/06/file.pdf");
        assertThat(signedUrl.method()).isEqualTo("PUT");
        assertThat(signedUrl.url()).contains("uploads/2026/06/file.pdf");
        assertThat(signedUrl.url()).contains("X-Amz-Signature=");
        assertThat(signedUrl.expiresAt()).isAfter(java.time.Instant.now());
    }

    @Test
    void createPresignedDownloadReturnsGetUrlForConfiguredBucketAndKey() {
        PresignedStorageUrl signedUrl = storageService.createPresignedDownload("uploads/2026/06/file.pdf");

        assertThat(signedUrl.objectKey()).isEqualTo("uploads/2026/06/file.pdf");
        assertThat(signedUrl.method()).isEqualTo("GET");
        assertThat(signedUrl.url()).contains("uploads/2026/06/file.pdf");
        assertThat(signedUrl.url()).contains("X-Amz-Signature=");
        assertThat(signedUrl.expiresAt()).isAfter(java.time.Instant.now());
    }
}
