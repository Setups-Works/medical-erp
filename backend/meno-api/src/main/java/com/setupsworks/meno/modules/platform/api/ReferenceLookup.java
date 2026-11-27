package com.setupsworks.meno.modules.platform.api;

import java.util.List;
import java.util.Optional;

/**
 * PIN code and IFSC lookups (PLT-22) for address and bank forms in any module. Empty when the code is unknown or the
 * list has not been loaded yet; callers then let the user type the details (VALIDATION_AND_BUSINESS_RULES.md).
 */
public interface ReferenceLookup {

    Optional<Pincode> pincode(String pincode);

    Optional<Ifsc> ifsc(String ifsc);

    /** {@code localities}: post-office names under this PIN, offered as city / locality suggestions. */
    record Pincode(String pincode, String stateCode, String district, List<String> localities) {
    }

    record Ifsc(String ifsc, String bank, String branch, String address, String city, String district, String state) {
    }
}
