package com.setupsworks.meno.modules.party.service;

import java.time.Duration;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

/** GSTIN_FETCH.md §6: cache by GSTIN (24 h ⚠ confirm) and a per-tenant lookup limit. */
@ConfigurationProperties("meno.party.gstin")
public record GstinLookupProperties(
        @DefaultValue("24h") Duration cacheTtl,
        @DefaultValue("30") int lookupsPerMinutePerTenant) {
}
