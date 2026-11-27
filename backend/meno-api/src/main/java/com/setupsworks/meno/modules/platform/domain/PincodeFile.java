package com.setupsworks.meno.modules.platform.domain;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.regex.Pattern;

/**
 * India Post "All India Pincode Directory" (one row per post office) → one row per PIN code (PLT-22): the state and
 * district most rows give, and the post-office names as localities. State names map to GST state codes through the
 * state table, so a name the table doesn't know skips the row instead of guessing.
 */
public final class PincodeFile {

    /** VALIDATION_AND_BUSINESS_RULES.md: 6 digits, not starting with 0. */
    private static final Pattern PIN = Pattern.compile("^[1-9][0-9]{5}$");
    /** Post-office type at the end of a name: "Anna Nagar S.O", "Ambattur H.O", "Kolathur B.O", "Mumbai G.P.O". */
    private static final Pattern OFFICE_TYPE = Pattern.compile("(?i)\\s+(g\\.?\\s?p\\.?\\s?o|[bshp]\\.?\\s?o)\\.?$");
    private static final Map<String, List<String>> ALIASES = Map.of(
            "pincode", List.of("pincode", "pin", "pincodes"),
            "district", List.of("district", "districtname"),
            "state", List.of("statename", "state"),
            "office", List.of("officename", "office", "postoffice", "locality"));
    private static final List<String> REQUIRED = List.of("pincode", "district", "state");
    static final int MAX_DISTRICT = 80;
    static final int MAX_LOCALITY = 100;

    public record Row(String pincode, String stateCode, String district, List<String> localities) {
    }

    public record Result(List<Row> rows, ReferenceFile.Report report) {
    }

    /** One post office from the online directory (state by name, as India Post spells it). */
    public record Office(String name, String district, String state) {
    }

    private static final class Agg {
        final Map<String, Integer> states = new LinkedHashMap<>();
        final Map<String, Integer> districts = new LinkedHashMap<>();
        final Set<String> localities = new LinkedHashSet<>();

        /** Adds one post office; returns why it was skipped, or null. Same rules for files and online answers. */
        String add(Map<String, String> byKey, String stateName, String rawDistrict, String rawOffice) {
            String stateCode = byKey.get(stateKey(stateName));
            if (stateCode == null) {
                return "Unknown state '" + stateName + "'";
            }
            String district = ReferenceFile.readable(rawDistrict);
            if (district.isEmpty() || district.length() > MAX_DISTRICT) {
                return "District is empty or longer than " + MAX_DISTRICT + " characters";
            }
            states.merge(stateCode, 1, Integer::sum);
            districts.merge(district, 1, Integer::sum);
            String office = ReferenceFile.readable(OFFICE_TYPE.matcher(rawOffice == null ? "" : rawOffice)
                    .replaceAll("").trim());
            if (!office.isEmpty() && office.length() <= MAX_LOCALITY) {
                localities.add(office);
            }
            return null;
        }

        Row row(String pin) {
            return new Row(pin, mostCommon(states), mostCommon(districts), List.copyOf(localities));
        }
    }

    private PincodeFile() {
    }

    /** {@code stateCodes}: GST state code by state name as the state table spells it (see {@link #stateKey}). */
    public static Result parse(CsvReader csv, Map<String, String> stateCodes) {
        Map<String, String> byKey = new HashMap<>();
        stateCodes.forEach((name, code) -> byKey.put(stateKey(name), code));
        List<String> header = csv.next();
        if (header == null) {
            throw new ReferenceFile.MissingColumns(REQUIRED);
        }
        Map<String, Integer> cols = ReferenceFile.columns(header, ALIASES, REQUIRED);
        ReferenceFile.Report report = new ReferenceFile.Report();
        Map<String, Agg> pins = new LinkedHashMap<>();
        for (List<String> row = csv.next(); row != null; row = csv.next()) {
            report.read();
            int line = csv.line();
            String pin = ReferenceFile.cell(row, cols, "pincode");
            if (!PIN.matcher(pin).matches()) {
                report.skip(line, "PIN code '" + pin + "' is not 6 digits starting 1-9");
                continue;
            }
            Agg agg = pins.computeIfAbsent(pin, p -> new Agg());
            String skipped = agg.add(byKey, ReferenceFile.cell(row, cols, "state"),
                    ReferenceFile.cell(row, cols, "district"), ReferenceFile.cell(row, cols, "office"));
            if (skipped != null) {
                report.skip(line, skipped);
                if (agg.states.isEmpty()) {
                    pins.remove(pin);
                }
            }
        }
        List<Row> rows = new ArrayList<>(pins.size());
        pins.forEach((pin, agg) -> rows.add(agg.row(pin)));
        return new Result(rows, report);
    }

    /**
     * One PIN from the online directory's post offices (PLT-22 online lookup), by the same rules as a file row.
     * Empty when the PIN is malformed or no office has a known state and a usable district.
     */
    public static Optional<Row> fromOffices(String pin, List<Office> offices, Map<String, String> stateCodes) {
        if (pin == null || !PIN.matcher(pin).matches() || offices == null) {
            return Optional.empty();
        }
        Map<String, String> byKey = new HashMap<>();
        stateCodes.forEach((name, code) -> byKey.put(stateKey(name), code));
        Agg agg = new Agg();
        for (Office o : offices) {
            agg.add(byKey, o.state(), o.district(), o.name());
        }
        return agg.states.isEmpty() ? Optional.empty() : Optional.of(agg.row(pin));
    }

    /** "TAMIL NADU", "Tamil Nadu", "The Dadra & Nagar Haveli and Daman & Diu" all compare by letters only. */
    public static String stateKey(String name) {
        String s = name == null ? "" : name.toLowerCase(Locale.ROOT).replace("&", " and ").trim();
        if (s.startsWith("the ")) {
            s = s.substring(4);
        }
        return s.replaceAll("[^a-z]", "");
    }

    /** First-seen wins a tie, so the result doesn't depend on hash order. */
    private static String mostCommon(Map<String, Integer> counts) {
        String best = null;
        int bestCount = 0;
        for (Map.Entry<String, Integer> e : counts.entrySet()) {
            if (e.getValue() > bestCount) {
                best = e.getKey();
                bestCount = e.getValue();
            }
        }
        return best;
    }
}
