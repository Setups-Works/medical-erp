package com.setupsworks.meno.modules.notification.service;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

/** Sender identity. SMTP server settings are Spring's {@code spring.mail.*} (MENO_MAIL_HOST, _PORT, _USER, _PASSWORD). */
@ConfigurationProperties("meno.mail")
public record MailProperties(@DefaultValue("MENO <no-reply@meno.local>") String from) {
}
