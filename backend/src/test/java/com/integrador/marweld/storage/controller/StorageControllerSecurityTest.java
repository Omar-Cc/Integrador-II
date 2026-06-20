package com.integrador.marweld.storage.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import com.integrador.marweld.auth.infrastructure.security.AsymmetricJwtService;

import java.util.Map;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:storage-security-test;DB_CLOSE_DELAY=-1",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.flyway.enabled=false",
        "app.storage.cloudflare.bucket-name=marweld-test-bucket",
        "app.storage.cloudflare.endpoint=https://mock-account-id.r2.cloudflarestorage.com",
        "app.storage.cloudflare.access-key=mock-access-key",
        "app.storage.cloudflare.secret-key=mock-secret-key",
        "app.storage.cloudflare.signed-url-ttl-seconds=900",
        "app.security.jwt.expiration-ms=3600000"
})
@AutoConfigureMockMvc
class StorageControllerSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private AsymmetricJwtService jwtService;

    @Test
    void storageEndpointsRequireJwt() throws Exception {
        mockMvc.perform(get("/api/storage/downloads/presign")
                        .param("objectKey", "uploads/2026/06/file.pdf"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void authenticatedUserCanCreatePresignedUploadUrl() throws Exception {
        String token = jwtService.generateToken("storage-user", Map.of("roles", "ROLE_USER"));

        mockMvc.perform(post("/api/storage/uploads/presign")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "filename": "Invoice 001.pdf",
                                  "contentType": "application/pdf",
                                  "contentLength": 1024
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.objectKey", containsString("uploads/")))
                .andExpect(jsonPath("$.objectKey", containsString("invoice-001.pdf")))
                .andExpect(jsonPath("$.uploadUrl", containsString("X-Amz-Signature=")))
                .andExpect(jsonPath("$.method").value("PUT"));
    }

    @Test
    void authenticatedUserCanCreatePresignedDownloadUrl() throws Exception {
        String token = jwtService.generateToken("storage-user", Map.of("roles", "ROLE_USER"));

        mockMvc.perform(get("/api/storage/downloads/presign")
                        .header("Authorization", "Bearer " + token)
                        .param("objectKey", "uploads/2026/06/file.pdf"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.objectKey").value("uploads/2026/06/file.pdf"))
                .andExpect(jsonPath("$.downloadUrl", containsString("X-Amz-Signature=")))
                .andExpect(jsonPath("$.method").value("GET"));
    }
}
