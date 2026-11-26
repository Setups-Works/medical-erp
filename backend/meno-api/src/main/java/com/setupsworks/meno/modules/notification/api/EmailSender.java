package com.setupsworks.meno.modules.notification.api;

/** Sends one email. Callers send after their transaction commits, so a mail failure never undoes business data. */
public interface EmailSender {

    void send(OutgoingEmail email);

    /** Plain-text email. Never put passwords in it; links with one-time tokens are fine (they expire). */
    record OutgoingEmail(String to, String subject, String text) {
    }
}
