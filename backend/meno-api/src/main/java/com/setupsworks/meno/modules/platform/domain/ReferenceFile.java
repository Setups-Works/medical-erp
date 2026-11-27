package com.setupsworks.meno.modules.platform.domain;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

/** What every list import reports back: rows read and skipped, a sample of problems, and missing columns. */
public final class ReferenceFile {

    /** At most this many problem lines are kept for the page; the counts cover every row. */
    public static final int MAX_SAMPLES = 50;

    public record Problem(int line, String reason) {
    }

    /** Thrown when the header lacks a required column; {@code missing} names them as the source spells them. */
    public static final class MissingColumns extends RuntimeException {
        private final List<String> missing;

        public MissingColumns(List<String> missing) {
            super("Missing columns: " + missing);
            this.missing = List.copyOf(missing);
        }

        public List<String> missing() {
            return missing;
        }
    }

    public static final class Report {
        private int read;
        private int skipped;
        private final List<Problem> samples = new ArrayList<>();
        private final Map<String, Integer> reasons = new LinkedHashMap<>();

        void read() {
            read++;
        }

        void skip(int line, String reason) {
            skipped++;
            reasons.merge(reason.replaceAll("'.*'", "'…'"), 1, Integer::sum);
            if (samples.size() < MAX_SAMPLES) {
                samples.add(new Problem(line, reason));
            }
        }

        public int rowsRead() {
            return read;
        }

        public int rowsSkipped() {
            return skipped;
        }

        public List<Problem> samples() {
            return List.copyOf(samples);
        }

        /** Skipped rows grouped by reason (values shown as '…'), so one bad column reads as one line. */
        public Map<String, Integer> reasons() {
            return Map.copyOf(reasons);
        }
    }

    private ReferenceFile() {
    }

    /** Header names compared without case, spaces or punctuation ("State Name" = "statename" = "STATE_NAME"). */
    static String key(String header) {
        return header == null ? "" : header.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]", "");
    }

    /** Index of each wanted column (first alias found wins); required ones missing → {@link MissingColumns}. */
    static Map<String, Integer> columns(List<String> header, Map<String, List<String>> aliases, List<String> required) {
        Map<String, Integer> byKey = new HashMap<>();
        for (int i = 0; i < header.size(); i++) {
            byKey.putIfAbsent(key(header.get(i)), i);
        }
        Map<String, Integer> found = new HashMap<>();
        aliases.forEach((name, names) -> names.stream().map(byKey::get).filter(i -> i != null).findFirst()
                .ifPresent(i -> found.put(name, i)));
        List<String> missing = required.stream().filter(r -> !found.containsKey(r)).toList();
        if (!missing.isEmpty()) {
            throw new MissingColumns(missing);
        }
        return found;
    }

    static String cell(List<String> row, Map<String, Integer> cols, String name) {
        Integer i = cols.get(name);
        if (i == null || i >= row.size()) {
            return "";
        }
        return row.get(i).trim().replaceAll("\\s+", " ");
    }

    static String cap(String value, int max) {
        if (value == null || value.isEmpty()) {
            return null;
        }
        return value.length() <= max ? value : value.substring(0, max).trim();
    }

    /** "CHENNAI CENTRAL" → "Chennai Central"; values already in mixed case are kept as the source wrote them. */
    static String readable(String value) {
        if (value.isEmpty() || !value.equals(value.toUpperCase(Locale.ROOT))) {
            return value;
        }
        StringBuilder out = new StringBuilder(value.length());
        boolean start = true;
        for (char ch : value.toLowerCase(Locale.ROOT).toCharArray()) {
            out.append(start ? Character.toUpperCase(ch) : ch);
            start = !Character.isLetterOrDigit(ch) && ch != '\'';
        }
        return out.toString();
    }
}
