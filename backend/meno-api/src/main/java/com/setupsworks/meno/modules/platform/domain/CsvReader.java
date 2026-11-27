package com.setupsworks.meno.modules.platform.domain;

import java.io.IOException;
import java.io.Reader;
import java.io.UncheckedIOException;
import java.util.ArrayList;
import java.util.List;

/**
 * Streaming RFC 4180 reader for the official list files (quoted fields, doubled quotes, commas and line breaks
 * inside quotes, CRLF or LF, a leading UTF-8 BOM). Small on purpose so the import needs no new library.
 */
public final class CsvReader {

    private final Reader in;
    private int line = 1;
    private int recordLine = 1;
    private int pushedBack = -2;
    private boolean started;

    public CsvReader(Reader in) {
        this.in = in;
    }

    /** The next record's fields, or null at the end of the file. Blank lines are skipped. */
    public List<String> next() {
        try {
            if (!started) {
                started = true;
                int first = read();
                if (first != '﻿') {
                    unread(first);
                }
            }
            while (true) {
                recordLine = line;
                List<String> record = readRecord();
                if (record == null) {
                    return null;
                }
                if (!(record.size() == 1 && record.get(0).isBlank())) {
                    return record;
                }
            }
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }

    /** Line number (1-based) where the record returned by the last {@link #next()} started. */
    public int line() {
        return recordLine;
    }

    private List<String> readRecord() throws IOException {
        int c = read();
        if (c == -1) {
            return null;
        }
        List<String> fields = new ArrayList<>();
        StringBuilder field = new StringBuilder();
        boolean quoted = false;
        while (true) {
            if (quoted) {
                if (c == -1) {
                    fields.add(field.toString());
                    return fields;
                }
                if (c == '"') {
                    int n = read();
                    if (n == '"') {
                        field.append('"');
                    } else {
                        quoted = false;
                        unread(n);
                    }
                } else {
                    if (c == '\n') {
                        line++;
                    }
                    field.append((char) c);
                }
            } else if (c == '"' && field.isEmpty()) {
                quoted = true;
            } else if (c == ',') {
                fields.add(field.toString());
                field.setLength(0);
            } else if (c == '\r' || c == '\n' || c == -1) {
                if (c == '\r') {
                    int n = read();
                    if (n != '\n') {
                        unread(n);
                    }
                }
                if (c != -1) {
                    line++;
                }
                fields.add(field.toString());
                return fields;
            } else {
                field.append((char) c);
            }
            c = read();
        }
    }

    private int read() throws IOException {
        if (pushedBack != -2) {
            int c = pushedBack;
            pushedBack = -2;
            return c;
        }
        return in.read();
    }

    private void unread(int c) {
        pushedBack = c;
    }
}
