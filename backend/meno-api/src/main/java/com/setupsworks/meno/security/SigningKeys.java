package com.setupsworks.meno.security;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.GeneralSecurityException;
import java.security.KeyFactory;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.interfaces.ECPrivateKey;
import java.security.interfaces.ECPublicKey;
import java.security.spec.ECGenParameterSpec;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;

import com.nimbusds.jose.jwk.Curve;
import com.nimbusds.jose.jwk.ECKey;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Loads the ES256 signing key pair. Generate one with:
 * <pre>
 * openssl genpkey -algorithm EC -pkeyopt ec_paramgen_curve:P-256 -out jwt_private.pem
 * openssl pkey -in jwt_private.pem -pubout -out jwt_public.pem
 * </pre>
 */
final class SigningKeys {

    private static final Logger log = LoggerFactory.getLogger(SigningKeys.class);

    private SigningKeys() {
    }

    static ECKey load(JwtProperties properties) {
        if (properties.privateKeyPath() != null && properties.publicKeyPath() != null) {
            return fromPem(read(properties.privateKeyPath()), read(properties.publicKeyPath()), properties.keyId());
        }
        if (hasText(properties.privateKeyPem()) && hasText(properties.publicKeyPem())) {
            return fromPem(properties.privateKeyPem(), properties.publicKeyPem(), properties.keyId());
        }
        if (!properties.allowEphemeralKey()) {
            throw new IllegalStateException("Set MENO_JWT_PRIVATE_KEY_PATH and MENO_JWT_PUBLIC_KEY_PATH "
                    + "(ES256 P-256 PEM files), or MENO_JWT_PRIVATE_KEY and MENO_JWT_PUBLIC_KEY (the PEM text). "
                    + "See SigningKeys for the openssl commands.");
        }
        log.warn("Signing access tokens with a throw-away key: tokens stop working when the app restarts. "
                + "Local/test only.");
        return ephemeral(properties.keyId());
    }

    static ECKey ephemeral(String keyId) {
        try {
            KeyPairGenerator generator = KeyPairGenerator.getInstance("EC");
            generator.initialize(new ECGenParameterSpec("secp256r1"));
            KeyPair pair = generator.generateKeyPair();
            return new ECKey.Builder(Curve.P_256, (ECPublicKey) pair.getPublic())
                    .privateKey((ECPrivateKey) pair.getPrivate())
                    .keyID(keyId)
                    .build();
        } catch (GeneralSecurityException e) {
            throw new IllegalStateException("Could not generate an EC key pair", e);
        }
    }

    private static String read(Path path) {
        try {
            return Files.readString(path);
        } catch (IOException e) {
            throw new IllegalStateException("Could not read the JWT key file " + path, e);
        }
    }

    private static ECKey fromPem(String privatePem, String publicPem, String keyId) {
        try {
            KeyFactory factory = KeyFactory.getInstance("EC");
            ECPrivateKey privateKey = (ECPrivateKey) factory.generatePrivate(
                    new PKCS8EncodedKeySpec(pemBody(privatePem, "PRIVATE KEY")));
            ECPublicKey publicKey = (ECPublicKey) factory.generatePublic(
                    new X509EncodedKeySpec(pemBody(publicPem, "PUBLIC KEY")));
            return new ECKey.Builder(Curve.P_256, publicKey).privateKey(privateKey).keyID(keyId).build();
        } catch (GeneralSecurityException | IllegalArgumentException e) {
            // Never include key material in the message.
            throw new IllegalStateException("Could not read the JWT keys (expect PKCS#8 / X.509 PEM, P-256)", e);
        }
    }

    private static byte[] pemBody(String pem, String label) {
        String begin = "-----BEGIN " + label + "-----";
        String end = "-----END " + label + "-----";
        int from = pem.indexOf(begin);
        int to = pem.indexOf(end);
        if (from < 0 || to < 0) {
            throw new IllegalStateException("Expected a PEM block '" + begin + "' (use openssl genpkey, not ecparam)");
        }
        // App settings often flatten newlines to spaces or a literal "\n"; the body is plain base64 either way.
        String body = pem.substring(from + begin.length(), to).replace("\\n", "").replaceAll("\\s", "");
        return Base64.getDecoder().decode(body);
    }

    private static boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}
