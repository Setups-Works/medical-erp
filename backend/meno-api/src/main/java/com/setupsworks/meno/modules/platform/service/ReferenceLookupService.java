package com.setupsworks.meno.modules.platform.service;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;

import com.setupsworks.meno.modules.integrations.api.PincodeDirectory;
import com.setupsworks.meno.modules.integrations.api.PincodeDirectory.PincodeLookupException;
import com.setupsworks.meno.modules.platform.api.ReferenceLookup;
import com.setupsworks.meno.modules.platform.domain.PincodeFile;
import com.setupsworks.meno.modules.platform.repository.ReferenceRows;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * PIN code and IFSC lookups (PLT-22). A PIN comes from MENO's own list first; a PIN the list doesn't have (or a list
 * not loaded yet) is asked of the online directory (ADR-0021), mapped by the same rules as a file row and kept in
 * memory for a day. The directory being down is the same as "unknown": the form lets the user type the details.
 */
@Service
class ReferenceLookupService implements ReferenceLookup {

    private static final Duration KEEP = Duration.ofDays(1);
    private static final int MAX_CACHED = 5_000;

    private final ReferenceRows rows;
    private final PincodeDirectory directory;
    private final Clock clock;
    /** PIN → answer (empty = the directory doesn't know it). Access-ordered, so the least recently used goes first. */
    private final Map<String, Cached> online = new LinkedHashMap<>(256, 0.75f, true) {
        @Override
        protected boolean removeEldestEntry(Map.Entry<String, Cached> eldest) {
            return size() > MAX_CACHED;
        }
    };

    private record Cached(Optional<Pincode> answer, Instant until) {
    }

    ReferenceLookupService(ReferenceRows rows, PincodeDirectory directory, Clock clock) {
        this.rows = rows;
        this.directory = directory;
        this.clock = clock;
    }

    // Not @Transactional: the online call must not hold a database connection while the directory answers.
    @Override
    public Optional<Pincode> pincode(String pincode) {
        if (pincode == null) {
            return Optional.empty();
        }
        String pin = pincode.trim();
        Optional<Pincode> own = rows.pincode(pin);
        return own.isPresent() ? own : online(pin);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Ifsc> ifsc(String ifsc) {
        return ifsc == null ? Optional.empty() : rows.ifsc(ifsc.trim().toUpperCase(Locale.ROOT));
    }

    private Optional<Pincode> online(String pin) {
        Instant now = clock.instant();
        synchronized (online) {
            Cached hit = online.get(pin);
            if (hit != null && hit.until().isAfter(now)) {
                return hit.answer();
            }
        }
        List<PincodeDirectory.PostOffice> offices;
        try {
            offices = directory.postOffices(pin);
        } catch (PincodeLookupException e) {
            return Optional.empty(); // not cached: the next lookup tries again
        }
        Optional<Pincode> answer = PincodeFile.fromOffices(pin,
                        offices.stream().map(o -> new PincodeFile.Office(o.name(), o.district(), o.state())).toList(),
                        rows.stateCodesByName())
                .map(r -> new Pincode(r.pincode(), r.stateCode(), r.district(), r.localities()));
        synchronized (online) {
            online.put(pin, new Cached(answer, now.plus(KEEP)));
        }
        return answer;
    }
}
