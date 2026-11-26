package com.setupsworks.meno.security;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Pattern;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Fixed-window counter per rule and client IP, kept in memory. Fine for one instance; move the counters to Redis
 * when the API runs on more than one instance. Answers 429 Problem Details {@code COMMON_RATE_LIMITED} with
 * Retry-After. The client IP is Tomcat's remote address, which honours X-Forwarded-For only from trusted proxies.
 */
class RateLimitFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(RateLimitFilter.class);
    private static final Pattern IPV4_WITH_PORT = Pattern.compile("^(\\d{1,3}(?:\\.\\d{1,3}){3}):\\d+$");
    private static final int CLEANUP_THRESHOLD = 10_000;

    private record Window(long startMillis, int count) {
    }

    private final RateLimitProperties properties;
    private final Clock clock;
    private final Map<String, Window> windows = new ConcurrentHashMap<>();

    RateLimitFilter(RateLimitProperties properties, Clock clock) {
        this.properties = properties;
        this.clock = clock;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        if (properties.enabled()) {
            for (var entry : properties.rules().entrySet()) {
                RateLimitProperties.Rule rule = entry.getValue();
                if (rule.method().equalsIgnoreCase(request.getMethod())
                        && rule.path().equals(request.getRequestURI())) {
                    long retryAfter = hit(entry.getKey(), rule, clientIp(request));
                    if (retryAfter > 0) {
                        reject(response, retryAfter);
                        return;
                    }
                }
            }
        }
        chain.doFilter(request, response);
    }

    /** Counts this request; returns seconds to wait when over the limit, else 0. */
    private long hit(String ruleName, RateLimitProperties.Rule rule, String ip) {
        long now = clock.millis();
        long windowMillis = rule.window().toMillis();
        Window window = windows.compute(ruleName + '|' + ip, (key, current) ->
                current == null || now - current.startMillis() >= windowMillis
                        ? new Window(now, 1)
                        : new Window(current.startMillis(), current.count() + 1));
        if (windows.size() > CLEANUP_THRESHOLD) {
            windows.entrySet().removeIf(e -> now - e.getValue().startMillis() >= windowMillis);
        }
        if (window.count() <= rule.capacity()) {
            return 0;
        }
        log.warn("Rate limit '{}' hit by {}", ruleName, ip);
        return Math.max(1, (window.startMillis() + windowMillis - now + 999) / 1000);
    }

    private static void reject(HttpServletResponse response, long retryAfterSeconds) throws IOException {
        response.setStatus(429);
        response.setHeader(HttpHeaders.RETRY_AFTER, Long.toString(retryAfterSeconds));
        response.setContentType("application/problem+json");
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.getWriter().write("""
                {"type":"https://meno.app/problems/common-rate-limited","title":"Too Many Requests","status":429,\
                "detail":"Too many attempts. Please wait a little and try again.","code":"COMMON_RATE_LIMITED"}""");
    }

    /** App Service sends "1.2.3.4:5678"; count per address, not per port. */
    static String clientIp(HttpServletRequest request) {
        String addr = request.getRemoteAddr();
        if (addr == null) {
            return "unknown";
        }
        var m = IPV4_WITH_PORT.matcher(addr);
        return m.matches() ? m.group(1) : addr;
    }
}
