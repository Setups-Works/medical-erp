package com.setupsworks.meno.common.web;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

import com.setupsworks.meno.common.error.MenoException;

import org.springframework.http.HttpStatus;

/**
 * Optimistic concurrency over HTTP (API_GUIDELINES.md "Headers": If-Match, ETag = version). The ETag of a resource
 * is its version in quotes ({@code "3"}); an update sends it back in {@code If-Match}. Weak tags ({@code W/"3"}) are
 * accepted because some proxies weaken them.
 */
public final class Versions {

    private static final Pattern TAG = Pattern.compile("^(?:W/)?\"?(\\d{1,18})\"?$");

    private Versions() {
    }

    /** {@code "3"} for version 3. */
    public static String etag(long version) {
        return "\"" + version + "\"";
    }

    /**
     * The version in an {@code If-Match} header. Missing → 428 COMMON_PRECONDITION_REQUIRED (an update without it
     * could silently overwrite someone else's change); unreadable → 400 COMMON_IF_MATCH_INVALID.
     */
    public static long fromIfMatch(String header) {
        if (header == null || header.isBlank()) {
            throw new MenoException(HttpStatus.PRECONDITION_REQUIRED, "COMMON_PRECONDITION_REQUIRED",
                    "Reload the page and try again.");
        }
        Matcher m = TAG.matcher(header.trim());
        if (!m.matches()) {
            throw new MenoException(HttpStatus.BAD_REQUEST, "COMMON_IF_MATCH_INVALID",
                    "Reload the page and try again.");
        }
        return Long.parseLong(m.group(1));
    }
}
