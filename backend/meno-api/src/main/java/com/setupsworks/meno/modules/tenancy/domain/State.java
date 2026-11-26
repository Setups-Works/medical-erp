package com.setupsworks.meno.modules.tenancy.domain;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import org.hibernate.annotations.Immutable;

/** Indian state / union territory keyed by its GST state code. Seeded reference data, read-only here. */
@Entity
@Immutable
@Table(name = "state")
public class State {

    @Id
    @Column(columnDefinition = "bpchar(2)")
    private String code;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String kind;

    @Column(name = "effective_from", nullable = false)
    private LocalDate effectiveFrom;

    @Column(name = "effective_to")
    private LocalDate effectiveTo;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder;

    protected State() {
    }

    /** In force on {@code day}: started on or before it and not yet ended. */
    public boolean isActiveOn(LocalDate day) {
        return !effectiveFrom.isAfter(day) && (effectiveTo == null || effectiveTo.isAfter(day));
    }

    public String getCode() {
        return code;
    }

    public String getName() {
        return name;
    }

    public String getKind() {
        return kind;
    }
}
