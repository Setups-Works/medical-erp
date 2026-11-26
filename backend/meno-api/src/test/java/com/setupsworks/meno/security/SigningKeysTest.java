package com.setupsworks.meno.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.nio.file.Files;
import java.nio.file.Path;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.spec.ECGenParameterSpec;
import java.time.Duration;
import java.util.Base64;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

class SigningKeysTest {

    @TempDir
    Path dir;

    @Test
    void loadsPkcs8AndX509PemFiles() throws Exception {
        KeyPair pair = newPair();
        Path privatePem = write("private.pem", "PRIVATE KEY", pair.getPrivate().getEncoded());
        Path publicPem = write("public.pem", "PUBLIC KEY", pair.getPublic().getEncoded());

        var key = SigningKeys.load(props(privatePem, publicPem, false));

        assertThat(key.getKeyID()).isEqualTo("kid-1");
        assertThat(key.isPrivate()).isTrue();
        assertThat(key.toECPublicKey()).isEqualTo(pair.getPublic());
    }

    @Test
    void loadsPemTextFromEnvEvenWhenNewlinesWereFlattened() throws Exception {
        KeyPair pair = newPair();
        String privatePem = pem("PRIVATE KEY", pair.getPrivate().getEncoded()).replace("\n", " ");
        String publicPem = pem("PUBLIC KEY", pair.getPublic().getEncoded()).replace("\n", "\\n");

        var key = SigningKeys.load(new JwtProperties("meno", "kid-2", Duration.ofMinutes(15), null, null,
                privatePem, publicPem, false));

        assertThat(key.getKeyID()).isEqualTo("kid-2");
        assertThat(key.toECPublicKey()).isEqualTo(pair.getPublic());
    }

    @Test
    void refusesToStartWithoutKeysUnlessEphemeralIsAllowed() {
        assertThatThrownBy(() -> SigningKeys.load(props(null, null, false)))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("MENO_JWT_PRIVATE_KEY_PATH");
        assertThat(SigningKeys.load(props(null, null, true)).isPrivate()).isTrue();
    }

    private static JwtProperties props(Path privatePem, Path publicPem, boolean ephemeral) {
        return new JwtProperties("meno", "kid-1", Duration.ofMinutes(15), privatePem, publicPem, null, null,
                ephemeral);
    }

    private static KeyPair newPair() throws Exception {
        KeyPairGenerator generator = KeyPairGenerator.getInstance("EC");
        generator.initialize(new ECGenParameterSpec("secp256r1"));
        return generator.generateKeyPair();
    }

    private static String pem(String label, byte[] der) {
        return "-----BEGIN " + label + "-----\n"
                + Base64.getMimeEncoder(64, "\n".getBytes()).encodeToString(der)
                + "\n-----END " + label + "-----\n";
    }

    private Path write(String name, String label, byte[] der) throws Exception {
        return Files.writeString(dir.resolve(name), pem(label, der));
    }
}
