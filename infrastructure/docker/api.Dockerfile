# meno-api image: multi-stage, layered jar, non-root, healthcheck (infrastructure/AGENTS.md).
# Build from the repo root:  docker build -f infrastructure/docker/api.Dockerfile -t meno-api backend/meno-api
# Used by CI (build + Trivy scan) and by docker compose. The free App Service deploy ships the jar instead (ADR-0018).

# ---- build ----
FROM eclipse-temurin:24.0.2_12-jdk-noble AS build
WORKDIR /src
# Dependencies first so they stay cached until the pom changes.
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN ./mvnw -B -q dependency:go-offline
COPY src/ src/
# Tests run in CI before this image is built; the image build only packages.
RUN ./mvnw -B -q -DskipTests package \
 && java -Djarmode=tools -jar target/meno-api-*.jar extract --layers --launcher --destination /extracted

# ---- runtime ----
FROM eclipse-temurin:24.0.2_12-jre-noble
RUN groupadd --system meno && useradd --system --gid meno --home /app --shell /usr/sbin/nologin meno
WORKDIR /app
# Least-changing layers first.
COPY --from=build --chown=meno:meno /extracted/dependencies/ ./
COPY --from=build --chown=meno:meno /extracted/spring-boot-loader/ ./
COPY --from=build --chown=meno:meno /extracted/snapshot-dependencies/ ./
COPY --from=build --chown=meno:meno /extracted/application/ ./
USER meno
EXPOSE 8080
ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=75 -XX:+ExitOnOutOfMemoryError"
# No curl in the JRE image: speak HTTP over bash's /dev/tcp.
HEALTHCHECK --interval=30s --timeout=5s --start-period=90s --retries=3 \
  CMD bash -c 'exec 3<>/dev/tcp/127.0.0.1/${PORT:-8080} && printf "GET /actuator/health HTTP/1.0\r\n\r\n" >&3 && grep -q "\"UP\"" <&3'
ENTRYPOINT ["java", "org.springframework.boot.loader.launch.JarLauncher"]
