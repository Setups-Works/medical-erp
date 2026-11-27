package com.setupsworks.meno.security;

import java.io.IOException;
import java.util.UUID;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Puts the token's tenant ({@code tid}) and user ({@code sub}) into {@link TenantContext} for this request only; a
 * platform token (ADR-0020) marks the request as platform instead, with no tenant.
 */
class TenantContextFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth instanceof JwtAuthenticationToken jwt && JwtTokenService.isPlatform(jwt.getToken())) {
            TenantContext.setPlatform(UUID.fromString(jwt.getToken().getSubject()));
        } else if (auth instanceof JwtAuthenticationToken jwt) {
            String tid = jwt.getToken().getClaimAsString(JwtTokenService.CLAIM_TENANT);
            TenantContext.set(tid == null ? null : UUID.fromString(tid), UUID.fromString(jwt.getToken().getSubject()));
        }
        try {
            chain.doFilter(request, response);
        } finally {
            // Threads are pooled: never let one request's tenant leak into the next.
            TenantContext.clear();
        }
    }
}
