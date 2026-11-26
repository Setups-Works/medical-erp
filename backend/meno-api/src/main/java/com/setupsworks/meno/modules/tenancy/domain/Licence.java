package com.setupsworks.meno.modules.tenancy.domain;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

import com.setupsworks.meno.common.persistence.Uuids;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/** Drug licence (Form 20/21, 20B/21B), FSSAI or narcotic licence of a company (branch-level overrides later). */
@Entity
@Table(name = "licence")
public class Licence extends TenantAudited {

    public enum Kind { DRUG_RETAIL, DRUG_WHOLESALE, FSSAI, NARCOTIC }

    @Id
    private UUID id;

    @Column(name = "company_id", nullable = false)
    private UUID companyId;

    @Column(name = "branch_id")
    private UUID branchId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Kind kind;

    @Column(nullable = false)
    private String number;

    @Column(name = "valid_to")
    private LocalDate validTo;

    protected Licence() {
    }

    public static Licence of(UUID tenantId, UUID companyId, Kind kind, UUID by, Instant now) {
        Licence l = new Licence();
        l.id = Uuids.v7();
        l.companyId = companyId;
        l.kind = kind;
        l.created(tenantId, by, now);
        return l;
    }

    public void update(String number, LocalDate validTo) {
        this.number = number;
        this.validTo = validTo;
    }

    public Kind getKind() {
        return kind;
    }

    public String getNumber() {
        return number;
    }

    public LocalDate getValidTo() {
        return validTo;
    }
}
