package com.integrador.marweld.notifications.application.service;

public interface EmailService {
    /**
     * Sends an HTML email to the specified recipient.
     *
     * @param to          Recipient email address.
     * @param subject     Email subject line.
     * @param htmlContent HTML body content.
     * @return Unique email identifier returned by the email service, or a mock identifier.
     */
    String sendEmail(String to, String subject, String htmlContent);
}
