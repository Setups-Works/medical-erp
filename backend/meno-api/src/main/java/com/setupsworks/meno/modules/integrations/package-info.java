/**
 * Adapters to outside services (GST verification now; GSP, WhatsApp, SMS later). Other modules use only the ports in
 * {@code api}; swapping a provider is a new adapter, no change elsewhere (GSTIN_FETCH.md §6).
 */
@org.springframework.modulith.ApplicationModule(id = "integrations", allowedDependencies = {})
package com.setupsworks.meno.modules.integrations;
