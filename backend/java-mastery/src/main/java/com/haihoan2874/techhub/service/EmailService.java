package com.haihoan2874.techhub.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;

/**
 * Email service sử dụng Resend HTTP API thay vì JavaMailSender SMTP.
 * Lý do: Render Free Tier block outbound SMTP (port 465/587) → dùng HTTPS API thay thế.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private static final String RESEND_API_URL = "https://api.resend.com/emails";

    private final WebClient.Builder webClientBuilder;

    @Value("${resend.api-key:}")
    private String resendApiKey;

    @Value("${resend.from-email:S-Life <onboarding@resend.dev>}")
    private String fromEmail;

    @Value("${app.backend-url}")
    private String backendUrl;

    @Async
    public void sendEmail(String to, String subject, String content, boolean isHtml) {
        if (to == null || to.trim().isEmpty() || !to.contains("@")) {
            log.warn("Invalid email address '{}'. Skipping email for subject: {}", to, subject);
            return;
        }

        if (resendApiKey == null || resendApiKey.isBlank()) {
            log.warn("RESEND_API_KEY not configured. Skipping email to: {} | subject: {}", to, subject);
            return;
        }

        String htmlContent = isHtml ? content : "<pre>" + content + "</pre>";
        Map<String, Object> body = Map.of(
                "from", fromEmail,
                "to", List.of(to),
                "subject", subject,
                "html", htmlContent
        );

        log.info("Sending email via Resend to: {} | subject: {}", to, subject);

        webClientBuilder.build()
                .post()
                .uri(RESEND_API_URL)
                .header("Authorization", "Bearer " + resendApiKey)
                .header("Content-Type", "application/json")
                .bodyValue(body)
                .retrieve()
                .bodyToMono(Map.class)
                .subscribe(
                        response -> log.info("Email sent successfully via Resend to: {} | id: {}", to, response.get("id")),
                        error -> log.error("CRITICAL: Failed to send email via Resend to '{}' subject '{}'. Error: {}",
                                to, subject, error.getMessage())
                );
    }

    public void sendVerificationEmail(String to, String token) {
        String subject = "Verify your account - S-LIFE";
        String verificationUrl = backendUrl + "/api/v1/auth/verify?token=" + token;
        String content = "<h3>Welcome to S-LIFE!</h3>" +
                "<p>Please click the link below to verify your account:</p>" +
                "<a href=\"" + verificationUrl + "\">Verify Account</a>" +
                "<p>The link will expire in 24 hours.</p>";

        sendEmail(to, subject, content, true);
    }

    public void sendPasswordResetEmail(String to, String token) {
        String subject = "Đặt lại mật khẩu của bạn - S-Life";
        String resetUrl = backendUrl + "/api/v1/auth/reset-password?token=" + token;
        String content = "<h3>Password Reset Request</h3>" +
                "<p>Click the link below to reset your password:</p>" +
                "<a href=\"" + resetUrl + "\">Reset Password</a>" +
                "<p>The link will expire in 1 hour.</p>";

        sendEmail(to, subject, content, true);
    }
}
