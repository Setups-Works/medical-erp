package com.setupsworks.meno.modules.platform.domain;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Version;

/** One list on /platform/reference-data (PLT-22): where it comes from, how often it changes, what is loaded now. */
@Entity
@Table(name = "reference_dataset")
public class ReferenceDataset {

    /** NOT_LOADED: loadable, never loaded. CURRENT / DUE: loaded; DUE once the refresh cadence has passed. LATER: a later phase loads it. */
    public enum Status { NOT_LOADED, CURRENT, DUE, LATER }

    @Id
    private String code;
    @Column(nullable = false)
    private String name;
    @Column(nullable = false)
    private String description;
    @Column(name = "source_name", nullable = false)
    private String sourceName;
    @Column(name = "source_url")
    private String sourceUrl;
    @Column(nullable = false)
    private String licence;
    private String attribution;
    @Column(name = "refresh_months", nullable = false)
    private int refreshMonths;
    @Column(name = "owner_module", nullable = false)
    private String ownerModule;
    @Column(nullable = false)
    private String phase;
    @Column(nullable = false)
    private boolean loadable;
    @Column(name = "sort_order", nullable = false)
    private int sortOrder;
    @Column(name = "row_count", nullable = false)
    private int rowCount;
    @Column(name = "source_date")
    private LocalDate sourceDate;
    @Column(name = "loaded_at")
    private Instant loadedAt;
    @Column(name = "loaded_by")
    private UUID loadedBy;
    @Version
    private long version;

    protected ReferenceDataset() {
    }

    /** Refresh is counted from the day the list was loaded (the source date can be months older than the load). */
    public LocalDate dueOn() {
        return loadedAt == null ? null : loadedAt.atOffset(ZoneOffset.UTC).toLocalDate().plusMonths(refreshMonths);
    }

    public Status status(LocalDate today) {
        if (!loadable) {
            return Status.LATER;
        }
        if (loadedAt == null) {
            return Status.NOT_LOADED;
        }
        return today.isBefore(dueOn()) ? Status.CURRENT : Status.DUE;
    }

    public void loaded(int rows, LocalDate sourceDate, Instant at, UUID by) {
        this.rowCount = rows;
        this.sourceDate = sourceDate;
        this.loadedAt = at;
        this.loadedBy = by;
    }

    public String getCode() { return code; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public String getSourceName() { return sourceName; }
    public String getSourceUrl() { return sourceUrl; }
    public String getLicence() { return licence; }
    public String getAttribution() { return attribution; }
    public int getRefreshMonths() { return refreshMonths; }
    public String getOwnerModule() { return ownerModule; }
    public String getPhase() { return phase; }
    public boolean isLoadable() { return loadable; }
    public int getSortOrder() { return sortOrder; }
    public int getRowCount() { return rowCount; }
    public LocalDate getSourceDate() { return sourceDate; }
    public Instant getLoadedAt() { return loadedAt; }
    public UUID getLoadedBy() { return loadedBy; }
}
