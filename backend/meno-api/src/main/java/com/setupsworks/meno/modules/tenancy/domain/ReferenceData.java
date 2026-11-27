package com.setupsworks.meno.modules.tenancy.domain;

import java.io.Serializable;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;

import org.hibernate.annotations.Immutable;

/** Seeded, read-only reference tables behind the onboarding options and rules (ADR-0014: data, not code). */
public final class ReferenceData {

    private ReferenceData() {
    }

    public record OptionKey(String listCode, String code) implements Serializable {
    }

    @Entity
    @Immutable
    @IdClass(OptionKey.class)
    @Table(name = "lookup_option")
    public static class LookupOption {
        @Id
        @Column(name = "list_code")
        private String listCode;
        @Id
        private String code;
        private String label;
        @Column(name = "sort_order")
        private int sortOrder;
        private boolean active;

        protected LookupOption() {
        }

        public String getListCode() {
            return listCode;
        }

        public String getCode() {
            return code;
        }

        public String getLabel() {
            return label;
        }

        public int getSortOrder() {
            return sortOrder;
        }

        public boolean isActive() {
            return active;
        }
    }

    public record BusinessTypeLicenceKey(String businessType, String licenceKind) implements Serializable {
    }

    @Entity
    @Immutable
    @IdClass(BusinessTypeLicenceKey.class)
    @Table(name = "business_type_licence")
    public static class BusinessTypeLicence {
        @Id
        @Column(name = "business_type")
        private String businessType;
        @Id
        @Column(name = "licence_kind")
        private String licenceKind;

        protected BusinessTypeLicence() {
        }

        public String getLicenceKind() {
            return licenceKind;
        }
    }

    @Entity
    @Immutable
    @Table(name = "registration_type_rule")
    public static class RegistrationTypeRule {
        @Id
        private String code;
        @Column(name = "gstin_required")
        private boolean gstinRequired;

        protected RegistrationTypeRule() {
        }

        public boolean isGstinRequired() {
            return gstinRequired;
        }
    }

    @Entity
    @Immutable
    @Table(name = "setting_definition")
    public static class SettingDefinition {
        @Id
        private String key;
        @Column(name = "value_type")
        private String valueType;
        @Column(name = "list_code")
        private String listCode;
        @Column(name = "default_value")
        private String defaultValue;
        @Column(name = "min_value")
        private Integer minValue;
        @Column(name = "max_value")
        private Integer maxValue;
        @Column(name = "sort_order")
        private int sortOrder;

        protected SettingDefinition() {
        }

        public String getKey() {
            return key;
        }

        public String getValueType() {
            return valueType;
        }

        public String getListCode() {
            return listCode;
        }

        public String getDefaultValue() {
            return defaultValue;
        }

        public Integer getMinValue() {
            return minValue;
        }

        public Integer getMaxValue() {
            return maxValue;
        }

        public int getSortOrder() {
            return sortOrder;
        }
    }

    @Entity
    @Immutable
    @Table(name = "onboarding_step")
    public static class OnboardingStep {
        @Id
        private String code;
        @Column(name = "sort_order")
        private int sortOrder;
        private boolean required;
        private boolean available;
        private String phase;
        private String route;

        protected OnboardingStep() {
        }

        public String getCode() {
            return code;
        }

        public int getSortOrder() {
            return sortOrder;
        }

        public boolean isRequired() {
            return required;
        }

        public boolean isAvailable() {
            return available;
        }

        public String getPhase() {
            return phase;
        }

        public String getRoute() {
            return route;
        }
    }
}
