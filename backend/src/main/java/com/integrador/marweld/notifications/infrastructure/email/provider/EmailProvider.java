package com.integrador.marweld.notifications.infrastructure.email.provider;

public interface EmailProvider {
    /**
     * Sends an HTML email to the specified recipient using the provider's specific API.
     *
     * @param to          Recipient email address.
     * @param subject     Email subject.
     * @param htmlContent HTML body content.
     * @return Unique identifier returned by the provider.
     */
    String send(String to, String subject, String htmlContent);

    /**
     * Retrieves the unique identifier name of this email provider.
     *
     * @return String matching the configuration value (e.g. "RESEND", "MOCK").
     */
    String getProviderName();
}
