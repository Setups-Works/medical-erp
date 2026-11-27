package com.setupsworks.meno.modules.notification.api;

/**
 * Sends one SMS. Callers send after their transaction commits, so an SMS failure never undoes business data.
 * The provider is configuration ({@code meno.sms.provider}); with none configured {@link #enabled()} is false and
 * callers answer {@code NOTIFICATION_CHANNEL_DISABLED} instead of pretending a message went out.
 */
public interface SmsSender {

    boolean enabled();

    void send(OutgoingSms sms);

    /** {@code to} is E.164 (+91…). Text must fit an approved (DLT) template once a real provider is used. */
    record OutgoingSms(String to, String text) {
    }
}
