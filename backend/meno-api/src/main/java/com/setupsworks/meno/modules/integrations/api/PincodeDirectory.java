package com.setupsworks.meno.modules.integrations.api;

import java.util.List;

/**
 * Port to an online PIN code directory (PLT-22 online lookup). Only the PIN is ever sent (never personal data).
 * Used when a PIN isn't in MENO's own list, so address forms still fill state and district.
 */
public interface PincodeDirectory {

    /**
     * Post offices under this PIN; empty when the directory doesn't know it. Throws {@link PincodeLookupException}
     * when the directory can't be reached.
     */
    List<PostOffice> postOffices(String pincode);

    /** Name of the active provider ("postalpincode", "none"). */
    String source();

    /** One post office, state by name as the directory spells it. */
    record PostOffice(String name, String district, String state) {
    }

    /** The directory didn't answer (timeout, error, unreadable): callers fall back to manual entry and don't cache. */
    class PincodeLookupException extends RuntimeException {

        public PincodeLookupException(String message) {
            super(message);
        }
    }
}
