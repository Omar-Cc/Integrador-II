package com.integrador.marweld.storage.service;

/**
 * Interface defining operations for file storage.
 * Supports Cloudflare R2 storage operations.
 */
public interface FileStorageService {

    /**
     * Uploads a file to a specific bucket.
     *
     * @param bucketName  Name of the bucket/container
     * @param objectKey   Unique path or identifier for the file in the bucket
     * @param content     Raw bytes of the file
     * @param contentType MIME type of the file (e.g., "image/png", "application/pdf")
     * @return The public URL or storage URI of the uploaded file
     */
    String uploadFile(String bucketName, String objectKey, byte[] content, String contentType);

    /**
     * Downloads a file's contents as a byte array.
     *
     * @param bucketName Name of the bucket/container
     * @param objectKey  Unique path or identifier for the file in the bucket
     * @return Raw bytes of the file
     */
    byte[] downloadFile(String bucketName, String objectKey);

    /**
     * Deletes a file from the bucket.
     *
     * @param bucketName Name of the bucket/container
     * @param objectKey  Unique path or identifier for the file in the bucket
     */
    void deleteFile(String bucketName, String objectKey);
}
