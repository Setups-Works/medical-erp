package com.setupsworks.meno.modules.tenancy.domain;

import java.time.Instant;
import java.util.UUID;

import com.setupsworks.meno.common.persistence.Uuids;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/** Legal entity with its GST registration (ONBOARDING.md step 4). Onboarding creates the primary one. */
@Entity
@Table(name = "company")
public class Company extends TenantAudited {

    @Id
    private UUID id;

    @Column(name = "is_primary", nullable = false)
    private boolean primary;

    @Column(name = "registration_type", nullable = false)
    private String registrationType;

    @Column(columnDefinition = "bpchar(15)")
    private String gstin;

    @Column(name = "legal_name", nullable = false)
    private String legalName;

    @Column(name = "trade_name")
    private String tradeName;

    @Column(nullable = false, columnDefinition = "bpchar(10)")
    private String pan;

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

    private String phone;

    private String email;

    @Column(name = "pharmacist_name")
    private String pharmacistName;

    @Column(name = "pharmacist_reg_no")
    private String pharmacistRegNo;

    @Column(name = "pharmacist_council_state", columnDefinition = "bpchar(2)")
    private String pharmacistCouncilState;

    protected Company() {
    }

    public static Company primary(UUID tenantId, UUID by, Instant now) {
        Company c = new Company();
        c.id = Uuids.v7();
        c.primary = true;
        c.created(tenantId, by, now);
        return c;
    }

    public record Details(String registrationType, String gstin, String legalName, String tradeName, String pan,
            String addressLine1, String addressLine2, String pin, String city, String district, String stateCode,
            String phone, String email) {
    }

    public void update(Details d) {
        registrationType = d.registrationType();
        gstin = d.gstin();
        legalName = d.legalName();
        tradeName = d.tradeName();
        pan = d.pan();
        addressLine1 = d.addressLine1();
        addressLine2 = d.addressLine2();
        pin = d.pin();
        city = d.city();
        district = d.district();
        stateCode = d.stateCode();
        phone = d.phone();
        email = d.email();
    }

    public Details details() {
        return new Details(registrationType, gstin, legalName, tradeName, pan, addressLine1, addressLine2, pin, city,
                district, stateCode, phone, email);
    }

    public void setPharmacist(String name, String regNo, String councilState) {
        pharmacistName = name;
        pharmacistRegNo = regNo;
        pharmacistCouncilState = councilState;
    }

    public UUID getId() {
        return id;
    }

    public String getStateCode() {
        return stateCode;
    }

    public String getPharmacistName() {
        return pharmacistName;
    }

    public String getPharmacistRegNo() {
        return pharmacistRegNo;
    }

    public String getPharmacistCouncilState() {
        return pharmacistCouncilState;
    }
}
