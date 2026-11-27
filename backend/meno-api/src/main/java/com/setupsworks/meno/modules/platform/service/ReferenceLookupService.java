package com.setupsworks.meno.modules.platform.service;

import java.util.Locale;
import java.util.Optional;

import com.setupsworks.meno.modules.platform.api.ReferenceLookup;
import com.setupsworks.meno.modules.platform.repository.ReferenceRows;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
class ReferenceLookupService implements ReferenceLookup {

    private final ReferenceRows rows;

    ReferenceLookupService(ReferenceRows rows) {
        this.rows = rows;
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Pincode> pincode(String pincode) {
        return pincode == null ? Optional.empty() : rows.pincode(pincode.trim());
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Ifsc> ifsc(String ifsc) {
        return ifsc == null ? Optional.empty() : rows.ifsc(ifsc.trim().toUpperCase(Locale.ROOT));
    }
}
