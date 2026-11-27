package com.setupsworks.meno.modules.platform.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import com.setupsworks.meno.modules.integrations.api.PincodeDirectory;
import com.setupsworks.meno.modules.integrations.api.PincodeDirectory.PincodeLookupException;
import com.setupsworks.meno.modules.integrations.api.PincodeDirectory.PostOffice;
import com.setupsworks.meno.modules.platform.api.ReferenceLookup.Pincode;
import com.setupsworks.meno.modules.platform.repository.ReferenceRows;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/** ADR-0021 order: MENO's own list first, then the online directory; answers cached, failures not. */
class ReferenceLookupServiceTest {

    private final ReferenceRows rows = mock(ReferenceRows.class);
    private final PincodeDirectory directory = mock(PincodeDirectory.class);
    private ReferenceLookupService service;

    @BeforeEach
    void setUp() {
        when(rows.pincode(org.mockito.ArgumentMatchers.anyString())).thenReturn(Optional.empty());
        when(rows.stateCodesByName()).thenReturn(Map.of("Delhi", "07"));
        service = new ReferenceLookupService(rows, directory,
                Clock.fixed(Instant.parse("2026-11-27T10:00:00Z"), ZoneOffset.UTC));
    }

    @Test
    void ownListWinsAndTheDirectoryIsNotAsked() {
        Pincode own = new Pincode("600040", "33", "Chennai", List.of("Anna Nagar"));
        when(rows.pincode("600040")).thenReturn(Optional.of(own));

        assertThat(service.pincode(" 600040 ")).contains(own);
        verify(directory, never()).postOffices("600040");
    }

    @Test
    void missingPinsComeFromTheDirectoryOnce() {
        when(directory.postOffices("110001")).thenReturn(List.of(new PostOffice("Baroda House", "Central Delhi", "Delhi")));

        assertThat(service.pincode("110001")).contains(new Pincode("110001", "07", "Central Delhi", List.of("Baroda House")));
        assertThat(service.pincode("110001")).isPresent();
        verify(directory, times(1)).postOffices("110001");
    }

    @Test
    void anUnknownPinIsRememberedButAnOutageIsRetried() {
        when(directory.postOffices("999999")).thenReturn(List.of());
        assertThat(service.pincode("999999")).isEmpty();
        assertThat(service.pincode("999999")).isEmpty();
        verify(directory, times(1)).postOffices("999999");

        when(directory.postOffices("110002")).thenThrow(new PincodeLookupException("down"));
        assertThat(service.pincode("110002")).isEmpty();
        assertThat(service.pincode("110002")).isEmpty();
        verify(directory, times(2)).postOffices("110002");
    }
}
