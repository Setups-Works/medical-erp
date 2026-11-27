package com.setupsworks.meno.modules.notification.service;

import java.util.Locale;

import com.setupsworks.meno.modules.notification.api.EmailSender;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * SMTP via Spring's JavaMailSender (Mailpit locally, any SMTP relay in the cloud). With no MENO_MAIL_HOST the
 * message is not sent and only the recipient's domain and the subject are logged (never the body: it can hold a
 * one-time link). Failures are logged, not thrown: the user can ask for the email again.
 */
@Service
class SmtpEmailSender implements EmailSender {

    private static final Logger log = LoggerFactory.getLogger(SmtpEmailSender.class);

    private final ObjectProvider<JavaMailSender> mailSender;
    private final MailProperties properties;
    private final String host;

    SmtpEmailSender(ObjectProvider<JavaMailSender> mailSender, MailProperties properties,
            @Value("${spring.mail.host:}") String host) {
        this.mailSender = mailSender;
        this.properties = properties;
        this.host = host;
    }

    @Override
    public void send(OutgoingEmail email) {
        JavaMailSender sender = mailSender.getIfAvailable();
        if (host == null || host.isBlank() || sender == null) {
            log.warn("Email '{}' to *@{} not sent: set MENO_MAIL_HOST to enable SMTP", email.subject(),
                    domainOf(email.to()));
            return;
        }
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(properties.from());
        message.setTo(email.to());
        message.setSubject(email.subject());
        message.setText(email.text());
        try {
            sender.send(message);
            log.info("Email '{}' sent to *@{}", email.subject(), domainOf(email.to()));
        } catch (MailException e) {
            log.error("Email '{}' to *@{} failed: {}", email.subject(), domainOf(email.to()), e.getMessage());
        }
    }

    private static String domainOf(String address) {
        int at = address == null ? -1 : address.indexOf('@');
        return at < 0 ? "?" : address.substring(at + 1).toLowerCase(Locale.ROOT);
    }
}
