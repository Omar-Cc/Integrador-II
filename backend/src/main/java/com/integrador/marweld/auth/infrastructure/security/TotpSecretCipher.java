package com.integrador.marweld.auth.infrastructure.security;

import com.integrador.marweld.auth.domain.exception.MfaSecretKeyNotConfiguredException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;

@Service
public class TotpSecretCipher {

    private static final String AES_GCM = "AES/GCM/NoPadding";
    private static final int IV_LENGTH_BYTES = 12;
    private static final int TAG_LENGTH_BITS = 128;

    private final SecureRandom secureRandom = new SecureRandom();
    private final String encryptionKey;

    public TotpSecretCipher(@Value("${app.security.mfa.totp-secret-encryption-key:}") String encryptionKey) {
        this.encryptionKey = encryptionKey;
    }

    public String encrypt(String plainText) {
        try {
            byte[] iv = new byte[IV_LENGTH_BYTES];
            secureRandom.nextBytes(iv);

            Cipher cipher = Cipher.getInstance(AES_GCM);
            cipher.init(Cipher.ENCRYPT_MODE, keySpec(), new GCMParameterSpec(TAG_LENGTH_BITS, iv));
            byte[] encrypted = cipher.doFinal(plainText.getBytes(StandardCharsets.UTF_8));

            ByteBuffer buffer = ByteBuffer.allocate(iv.length + encrypted.length);
            buffer.put(iv);
            buffer.put(encrypted);
            return Base64.getEncoder().encodeToString(buffer.array());
        } catch (MfaSecretKeyNotConfiguredException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new IllegalStateException("No se pudo cifrar el secreto TOTP.", ex);
        }
    }

    public String decrypt(String encryptedText) {
        try {
            byte[] payload = Base64.getDecoder().decode(encryptedText);
            ByteBuffer buffer = ByteBuffer.wrap(payload);
            byte[] iv = new byte[IV_LENGTH_BYTES];
            buffer.get(iv);
            byte[] encrypted = new byte[buffer.remaining()];
            buffer.get(encrypted);

            Cipher cipher = Cipher.getInstance(AES_GCM);
            cipher.init(Cipher.DECRYPT_MODE, keySpec(), new GCMParameterSpec(TAG_LENGTH_BITS, iv));
            return new String(cipher.doFinal(encrypted), StandardCharsets.UTF_8);
        } catch (MfaSecretKeyNotConfiguredException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new IllegalStateException("No se pudo descifrar el secreto TOTP.", ex);
        }
    }

    private SecretKeySpec keySpec() {
        if (encryptionKey == null || encryptionKey.isBlank()) {
            throw new MfaSecretKeyNotConfiguredException();
        }
        byte[] decodedKey = Base64.getDecoder().decode(encryptionKey);
        if (decodedKey.length != 32) {
            throw new MfaSecretKeyNotConfiguredException();
        }
        return new SecretKeySpec(decodedKey, "AES");
    }
}
