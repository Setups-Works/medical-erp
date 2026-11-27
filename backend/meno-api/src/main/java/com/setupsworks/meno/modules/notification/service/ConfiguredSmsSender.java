package com.setupsworks.meno.modules.notification.service;

import java.util.Locale;

import com.setupsworks.meno.modules.notification.api.SmsSender;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/**
 * Picks the SMS channel from {@code meno.sms.provider}. Only {@code log} exists until a provider is chosen (INT-02):
 * it prints the text (which holds a one-time code), so it is set only in application-local.yml, never in
 * staging or production. Unknown providers fail start-up rather than silently dropping messages.
 */
@Service
class ConfiguredSmsSender implements SmsSender {

    private static final Logger log = LoggerFactory.getLogger(ConfiguredSmsSender.class);

    private final String provider;

    ConfiguredSmsSender(SmsProperties properties) {
        this.provider = properties.provider().trim().toLowerCase(Locale.ROOT);
        if (!provider.equals("none") && !provider.equals("log")) {
            throw new IllegalStateException("meno.sms.provider must be none or log (got '" + provider + "')");
        }
    }

    @Override
    public boolean enabled() {
        return !provider.equals("none");
    }

    @Override
    public void send(OutgoingSms sms) {
        if (!enabled()) {
            log.warn("SMS to {} not sent: meno.sms.provider is none", masked(sms.to()));
            return;
        }
        log.info("[local SMS] to {}: {}", masked(sms.to()), sms.logText());
    }

    private static String masked(String to) {
        return to == null || to.length() < 4 ? "?" : "******" + to.substring(to.length() - 4);
    }
}
