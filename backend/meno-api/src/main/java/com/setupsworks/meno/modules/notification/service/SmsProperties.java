package com.setupsworks.meno.modules.notification.service;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

/**
 * SMS channel. {@code none} (default): SMS is off. {@code log}: local development only, the message is written to
 * the log so a developer can read the code. A real provider is chosen under INT-02 (P5) and added here.
 */
@ConfigurationProperties("meno.sms")
public record SmsProperties(@DefaultValue("none") String provider) {
}
