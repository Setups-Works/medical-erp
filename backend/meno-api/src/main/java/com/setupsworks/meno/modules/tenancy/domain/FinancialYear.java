package com.setupsworks.meno.modules.tenancy.domain;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

import com.setupsworks.meno.common.persistence.Uuids;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "financial_year")
public class FinancialYear extends TenantAudited {

    @Id
    private UUID id;

    @Column(name = "company_id", nullable = false)
    private UUID companyId;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "books_start_date", nullable = false)
    private LocalDate booksStartDate;

    @Column(nullable = false)
    private String status;

    protected FinancialYear() {
    }

    public static FinancialYear open(UUID tenantId, UUID companyId, UUID by, Instant now) {
        FinancialYear fy = new FinancialYear();
        fy.id = Uuids.v7();
        fy.companyId = companyId;
        fy.status = "OPEN";
        fy.created(tenantId, by, now);
        return fy;
    }

    public void update(LocalDate start, LocalDate end, LocalDate booksStart) {
        startDate = start;
        endDate = end;
        booksStartDate = booksStart;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public LocalDate getBooksStartDate() {
        return booksStartDate;
    }
}
