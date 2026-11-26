package com.setupsworks.meno.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * OpenAPI description served at /v3/api-docs and Swagger UI at /swagger-ui.html (on only when
 * MENO_API_DOCS_ENABLED=true). The committed copy lives in contracts/openapi/meno-api.yaml (AGENTS.md rule 9).
 */
@Configuration(proxyBeanMethods = false)
class OpenApiConfig {

    static final String BEARER = "bearerAuth";

    @Bean
    OpenAPI menoOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("MENO API")
                        .version("v1")
                        .description("""
                                MENO Pharmacy ERP backend. Errors are RFC 9457 Problem Details with a stable \
                                `code` (MODULE_REASON). Sign in with POST /api/v1/auth/login, then press \
                                Authorize and paste the accessToken."""))
                // Relative server so the committed spec does not depend on the host that generated it.
                .addServersItem(new Server().url("/"))
                .components(new Components().addSecuritySchemes(BEARER, new SecurityScheme()
                        .type(SecurityScheme.Type.HTTP)
                        .scheme("bearer")
                        .bearerFormat("JWT")
                        .description("Access token from /api/v1/auth/login or /api/v1/auth/refresh")))
                // Secure by default; public endpoints opt out with @SecurityRequirements({}).
                .addSecurityItem(new SecurityRequirement().addList(BEARER));
    }
}
