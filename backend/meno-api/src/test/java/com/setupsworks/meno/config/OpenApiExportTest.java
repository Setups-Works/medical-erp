package com.setupsworks.meno.config;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;

import com.setupsworks.meno.support.TestcontainersConfiguration;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.junit.jupiter.Testcontainers;

/**
 * Writes the live OpenAPI spec to contracts/openapi/meno-api.yaml (AGENTS.md rule 9) on every build, so the
 * committed contract always matches the code: if `git diff contracts/openapi` shows changes after
 * `./mvnw verify`, commit them with your endpoint change.
 */
@Testcontainers(disabledWithoutDocker = true)
@Import(TestcontainersConfiguration.class)
@SpringBootTest(properties = {
        "meno.security.jwt.allow-ephemeral-key=true",
        "springdoc.api-docs.enabled=true",
        "springdoc.swagger-ui.enabled=true"
})
@AutoConfigureMockMvc
class OpenApiExportTest {

    private static final Path SPEC = Path.of("..", "..", "contracts", "openapi", "meno-api.yaml");

    @Autowired
    MockMvc mvc;

    @Test
    void exportsTheSpecToContracts() throws Exception {
        mvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.paths['/api/v1/auth/login'].post").exists())
                .andExpect(jsonPath("$.paths['/api/v1/auth/me'].get").exists())
                .andExpect(jsonPath("$.components.securitySchemes.bearerAuth.scheme").value("bearer"))
                // Public auth endpoints must not ask for a bearer token.
                .andExpect(jsonPath("$.paths['/api/v1/auth/login'].post.security").isEmpty());

        String yaml = mvc.perform(get("/v3/api-docs.yaml"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString(StandardCharsets.UTF_8);
        Files.createDirectories(SPEC.getParent());
        Files.writeString(SPEC, yaml.endsWith("\n") ? yaml : yaml + "\n", StandardCharsets.UTF_8);
        assertThat(SPEC).exists();
    }

    @Test
    void swaggerUiIsReachableWithoutSigningIn() throws Exception {
        mvc.perform(get("/swagger-ui/index.html")).andExpect(status().isOk());
    }
}
