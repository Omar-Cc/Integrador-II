package com.integrador.marweld.auth.infrastructure.security;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;

/**
 * Service to generate QR Codes from strings/URIs using Google ZXing.
 */
@Service
public class QrCodeService {

    private static final Logger log = LoggerFactory.getLogger(QrCodeService.class);

    /**
     * Encodes target text into a QR Code image and returns PNG byte data.
     * Useful for TOTP registration QR codes.
     *
     * @param text   Text contents to encode.
     * @param width  Target image width in pixels.
     * @param height Target image height in pixels.
     * @return Byte array containing PNG formatted image.
     */
    public byte[] generateQrCode(String text, int width, int height) {
        log.info("Generating QR Code. Dimensions: {}x{}", width, height);
        try {
            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            BitMatrix bitMatrix = qrCodeWriter.encode(text, BarcodeFormat.QR_CODE, width, height);
            
            ByteArrayOutputStream pngOutputStream = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", pngOutputStream);
            
            log.info("QR Code successfully generated.");
            return pngOutputStream.toByteArray();
        } catch (Exception e) {
            log.error("Failed to generate QR Code image: {}", e.getMessage(), e);
            throw new RuntimeException("QR Code generation failure", e);
        }
    }
}
