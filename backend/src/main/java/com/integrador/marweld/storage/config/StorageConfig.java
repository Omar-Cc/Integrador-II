package com.integrador.marweld.storage.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

import java.net.URI;

/**
 * Configuration class for Cloudflare R2 S3 compatibility clients.
 */
@Configuration
@EnableConfigurationProperties(R2StorageProperties.class)
public class StorageConfig {

    private static final Logger log = LoggerFactory.getLogger(StorageConfig.class);
    private static final Region R2_REGION = Region.US_EAST_1;

    @Bean
    public S3Client cloudflareR2Client(R2StorageProperties properties) {
        if (properties.isUsingMockEndpoint()) {
            log.info("Cloudflare R2 credentials or endpoint not fully set. Initializing dummy S3 Client for local runtime.");
            return S3Client.builder()
                    .endpointOverride(URI.create("https://dummy.r2.cloudflarestorage.com"))
                    .credentialsProvider(StaticCredentialsProvider.create(
                            AwsBasicCredentials.create("dummy-key", "dummy-secret")
                    ))
                    .region(R2_REGION)
                    .build();
        }

        log.info("Configuring Cloudflare R2 Client with endpoint: {}", properties.endpoint());
        return S3Client.builder()
                .endpointOverride(URI.create(properties.endpoint()))
                .credentialsProvider(credentialsProvider(properties))
                .region(R2_REGION)
                .build();
    }

    @Bean
    public S3Presigner cloudflareR2Presigner(R2StorageProperties properties) {
        String endpoint = properties.isUsingMockEndpoint()
                ? "https://dummy.r2.cloudflarestorage.com"
                : properties.endpoint();

        return S3Presigner.builder()
                .endpointOverride(URI.create(endpoint))
                .credentialsProvider(properties.isUsingMockEndpoint()
                        ? StaticCredentialsProvider.create(AwsBasicCredentials.create("dummy-key", "dummy-secret"))
                        : credentialsProvider(properties))
                .region(R2_REGION)
                .build();
    }

    private StaticCredentialsProvider credentialsProvider(R2StorageProperties properties) {
        return StaticCredentialsProvider.create(
                AwsBasicCredentials.create(properties.accessKey(), properties.secretKey())
        );
    }
}
