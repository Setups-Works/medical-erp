package com.setupsworks.meno.modules.platform.domain;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;

/**
 * RBI NEFT / RTGS branch list (saved as CSV) → one row per IFSC (PLT-22). Accepts RBI's column names and the common
 * mirror's (BANK, IFSC, BRANCH, ADDRESS, CITY / CENTRE, DISTRICT, STATE). The first row of a repeated IFSC wins.
 */
public final class IfscFile {

    /** VALIDATION_AND_BUSINESS_RULES.md. */
    private static final Pattern IFSC = Pattern.compile("^[A-Z]{4}0[A-Z0-9]{6}$");
    private static final Map<String, List<String>> ALIASES = Map.of(
            "ifsc", List.of("ifsc", "ifsccode"),
            "bank", List.of("bank", "bankname"),
            "branch", List.of("branch", "branchname"),
            "address", List.of("address"),
            "city", List.of("city", "centre", "city1"),
            "district", List.of("district", "city2"),
            "state", List.of("state"));
    private static final List<String> REQUIRED = List.of("ifsc", "bank", "branch");

    public record Row(String ifsc, String bank, String branch, String address, String city, String district,
            String state) {
    }

    public record Result(List<Row> rows, ReferenceFile.Report report) {
    }

    private IfscFile() {
    }

    public static Result parse(CsvReader csv) {
        List<String> header = csv.next();
        if (header == null) {
            throw new ReferenceFile.MissingColumns(REQUIRED);
        }
        Map<String, Integer> cols = ReferenceFile.columns(header, ALIASES, REQUIRED);
        ReferenceFile.Report report = new ReferenceFile.Report();
        Set<String> seen = new HashSet<>();
        List<Row> rows = new ArrayList<>();
        for (List<String> row = csv.next(); row != null; row = csv.next()) {
            report.read();
            int line = csv.line();
            String ifsc = ReferenceFile.cell(row, cols, "ifsc").toUpperCase(Locale.ROOT);
            String bank = ReferenceFile.cell(row, cols, "bank");
            String branch = ReferenceFile.cell(row, cols, "branch");
            if (!IFSC.matcher(ifsc).matches()) {
                report.skip(line, "IFSC '" + ifsc + "' is not 4 letters, 0, then 6 letters or digits");
                continue;
            }
            if (bank.isEmpty() || branch.isEmpty() || bank.length() > 120 || branch.length() > 160) {
                report.skip(line, "Bank or branch is empty or too long");
                continue;
            }
            if (!seen.add(ifsc)) {
                report.skip(line, "IFSC '" + ifsc + "' repeats an earlier row");
                continue;
            }
            rows.add(new Row(ifsc, bank, branch, ReferenceFile.cap(ReferenceFile.cell(row, cols, "address"), 500),
                    ReferenceFile.cap(ReferenceFile.cell(row, cols, "city"), 80),
                    ReferenceFile.cap(ReferenceFile.cell(row, cols, "district"), 80),
                    ReferenceFile.cap(ReferenceFile.cell(row, cols, "state"), 80)));
        }
        return new Result(rows, report);
    }
}
