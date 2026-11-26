package com.setupsworks.meno.modules.tenancy.api;

/** A state or union territory as shown in pickers; {@code code} is the GST state code ("33"). */
public record StateView(String code, String name, String kind) {
}
