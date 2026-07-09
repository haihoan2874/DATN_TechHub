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
 * Email service sử dụng Brevo HTTP API thay vì JavaMailSender SMTP.
 * Lý do: Render Free Tier block outbound SMTP (port 465/587).
 * Ưu điểm của Brevo so với Resend: Cho phép gửi từ @gmail.com miễn phí, không bắt buộc có tên miền.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private static final String BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

    private final WebClient.Builder webClientBuilder;

    @Value("${brevo.api-key:}")
    private String brevoApiKey;

    @Value("${brevo.sender.email:hoanhonghot85@gmail.com}")
    private String senderEmail;

    @Value("${brevo.sender.name:S-Life}")
    private String senderName;

    @Value("${app.backend-url}")
    private String backendUrl;

    @Async
    public void sendEmail(String to, String subject, String content, boolean isHtml) {
        if (to == null || to.trim().isEmpty() || !to.contains("@")) {
            log.warn("Invalid email address '{}'. Skipping email for subject: {}", to, subject);
            return;
        }

        if (brevoApiKey == null || brevoApiKey.isBlank()) {
            log.warn("BREVO_API_KEY not configured. Skipping email to: {} | subject: {}", to, subject);
            return;
        }

        String htmlContent = isHtml ? content : "<pre>" + content + "</pre>";
        
        Map<String, Object> body = Map.of(
                "sender", Map.of("name", senderName, "email", senderEmail),
                "to", List.of(Map.of("email", to)),
                "subject", subject,
                "htmlContent", htmlContent
        );

        log.info("Sending email via Brevo to: {} | subject: {}", to, subject);

        webClientBuilder.build()
                .post()
                .uri(BREVO_API_URL)
                .header("api-key", brevoApiKey)
                .header("accept", "application/json")
                .header("content-type", "application/json")
                .bodyValue(body)
                .retrieve()
                .bodyToMono(Map.class)
                .subscribe(
                        response -> log.info("Email sent successfully via Brevo to: {} | messageId: {}", to, response.get("messageId")),
                        error -> log.error("CRITICAL: Failed to send email via Brevo to '{}' subject '{}'. Error: {}",
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
