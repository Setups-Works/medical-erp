package com.setupsworks.meno.modules.tenancy.domain;

import java.time.Instant;
import java.util.UUID;

import com.setupsworks.meno.common.persistence.Uuids;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/** A shop or warehouse with its own stock and number series (MULTI_TENANCY.md). The first one is the head office. */
@Entity
@Table(name = "branch")
public class Branch extends TenantAudited {

    @Id
    private UUID id;

    @Column(name = "company_id", nullable = false)
    private UUID companyId;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String code;

    @Column(name = "is_head_office", nullable = false)
    private boolean headOffice;

    @Column(name = "address_line1", nullable = false)
    private String addressLine1;

    @Column(name = "address_line2")
    private String addressLine2;

    @Column(nullable = false, columnDefinition = "bpchar(6)")
    private String pin;

    @Column(nullable = false)
    private String city;

    private String district;

    @Column(name = "state_code", nullable = false, columnDefinition = "bpchar(2)")
    private String stateCode;

    protected Branch() {
    }

    public static Branch of(UUID tenantId, UUID companyId, boolean headOffice, UUID by, Instant now) {
        Branch b = new Branch();
        b.id = Uuids.v7();
        b.companyId = companyId;
        b.headOffice = headOffice;
        b.created(tenantId, by, now);
        return b;
    }

    public record Details(String name, String code, String addressLine1, String addressLine2, String pin, String city,
            String district, String stateCode) {
    }

    public void update(Details d) {
        name = d.name();
        code = d.code();
        addressLine1 = d.addressLine1();
        addressLine2 = d.addressLine2();
        pin = d.pin();
        city = d.city();
        district = d.district();
        stateCode = d.stateCode();
    }

    public Details details() {
        return new Details(name, code, addressLine1, addressLine2, pin, city, district, stateCode);
    }

    public UUID getId() {
        return id;
    }

    public boolean isHeadOffice() {
        return headOffice;
    }

    public String getCode() {
        return code;
    }
}
