/**
 * MENO staff realm and shared reference data (ADR-0020, PLT-22). Not tenant-owned: platform staff sign in here and
 * manage lists every tenant reads (PIN codes, IFSC); PINs missing from the list are asked of the online directory
 * through {@code integrations::api} (ADR-0021). Other modules use {@code platform::api} only.
 */
@org.springframework.modulith.ApplicationModule(id = "platform", allowedDependencies = { "integrations::api" })
package com.setupsworks.meno.modules.platform;
