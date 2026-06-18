package com.integrador.marweld.auth.infrastructure.security;

import com.integrador.marweld.auth.domain.exception.MfaSecretKeyNotConfiguredException;
import org.junit.jupiter.api.Test;

import java.security.SecureRandom;
import java.util.Base64;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class TotpSecretCipherTest {

    @Test
    void encryptsAndDecryptsTotpSecret() {
        byte[] key = new byte[32];
        new SecureRandom().nextBytes(key);
        TotpSecretCipher cipher = new TotpSecretCipher(Base64.getEncoder().encodeToString(key));

        String encrypted = cipher.encrypt("JBSWY3DPEHPK3PXP");
        String decrypted = cipher.decrypt(encrypted);

        assertThat(encrypted).isNotEqualTo("JBSWY3DPEHPK3PXP");
        assertThat(decrypted).isEqualTo("JBSWY3DPEHPK3PXP");
    }

    @Test
    void rejectsMissingEncryptionKey() {
        TotpSecretCipher cipher = new TotpSecretCipher("");

        assertThatThrownBy(() -> cipher.encrypt("secret"))
                .isInstanceOf(MfaSecretKeyNotConfiguredException.class);
    }
}
