package com.setupsworks.meno.modules.tenancy.domain;

import java.util.regex.Pattern;

/**
 * GSTIN format and check character (VALIDATION_AND_BUSINESS_RULES.md §4, GSTIN_FETCH.md "Check character":
 * base-36 values of characters 1–14, weights 1, 2, 1, 2…; sum the two base-36 digits of each product;
 * check = (36 − sum mod 36) mod 36).
 */
public final class Gstin {

    private static final Pattern FORMAT = Pattern.compile("^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$");
    private static final String BASE36 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    private Gstin() {
    }

    public static boolean hasValidFormat(String gstin) {
        return gstin != null && FORMAT.matcher(gstin).matches();
    }

    public static boolean hasValidCheckCharacter(String gstin) {
        return hasValidFormat(gstin) && checkCharacter(gstin.substring(0, 14)) == gstin.charAt(14);
    }

    static char checkCharacter(String first14) {
        int sum = 0;
        for (int i = 0; i < 14; i++) {
            int product = BASE36.indexOf(first14.charAt(i)) * (i % 2 == 0 ? 1 : 2);
            sum += product / 36 + product % 36;
        }
        return BASE36.charAt((36 - sum % 36) % 36);
    }

    public static String stateCode(String gstin) {
        return gstin.substring(0, 2);
    }

    /** PAN is GSTIN characters 3–12. */
    public static String pan(String gstin) {
        return gstin.substring(2, 12);
    }
}
