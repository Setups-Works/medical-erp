package com.setupsworks.meno.modules.tenancy.domain;

import java.time.Instant;
import java.util.UUID;

import com.setupsworks.meno.common.persistence.Uuids;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Version;

@Entity
@Table(name = "tenant")
public class Tenant {

    public enum Status { ACTIVE, SUSPENDED }

    @Id
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String code;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "created_by")
    private UUID createdBy;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Column(name = "updated_by")
    private UUID updatedBy;

    @Column(name = "state_code", columnDefinition = "bpchar(2)")
    private String stateCode;

    @Column(name = "start_option")
    private String startOption;

    @Column(name = "partner_code")
    private String partnerCode;

    @Column(name = "signup_key")
    private UUID signupKey;

    @Column(name = "business_type")
    private String businessType;

    @Column(name = "branch_count")
    private String branchCount;

    @Column(name = "catalogue_size")
    private String catalogueSize;

    @Column(name = "current_software")
    private String currentSoftware;

    @Column
    private String language;

    @Column(name = "go_live_date")
    private java.time.LocalDate goLiveDate;

    @Column(name = "go_live_at")
    private Instant goLiveAt;

    @Version
    private long version;

    protected Tenant() {
    }

    public Tenant(String name, String code, Instant now) {
        this.id = Uuids.v7();
        this.name = name;
        this.code = code;
        this.status = Status.ACTIVE;
        this.createdAt = now;
        this.updatedAt = now;
    }

    /** Sign-up details (AUT-04); set once when the tenant is created by sign-up. */
    public void recordSignup(String stateCode, String startOption, String partnerCode, UUID signupKey) {
        this.stateCode = stateCode;
        this.startOption = startOption;
        this.partnerCode = partnerCode;
        this.signupKey = signupKey;
    }

    public record BusinessProfile(String businessType, String branchCount, String catalogueSize,
            String currentSoftware, String language) {
    }

    public void updateBusinessProfile(BusinessProfile p, Instant now) {
        businessType = p.businessType();
        branchCount = p.branchCount();
        catalogueSize = p.catalogueSize();
        currentSoftware = p.currentSoftware();
        language = p.language();
        updatedAt = now;
    }

    public BusinessProfile businessProfile() {
        return new BusinessProfile(businessType, branchCount, catalogueSize, currentSoftware, language);
    }

    public void goLive(java.time.LocalDate date, Instant now) {
        goLiveDate = date;
        goLiveAt = now;
        updatedAt = now;
    }

    public boolean isLive() {
        return goLiveAt != null;
    }

    public java.time.LocalDate getGoLiveDate() {
        return goLiveDate;
    }

    public String getBusinessType() {
        return businessType;
    }

    public String getStateCode() {
        return stateCode;
    }

    public boolean isActive() {
        return status == Status.ACTIVE;
    }

    public UUID getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getCode() {
        return code;
    }
}
