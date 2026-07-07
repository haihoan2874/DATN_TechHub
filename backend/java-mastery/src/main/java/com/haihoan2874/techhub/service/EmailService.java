package com.haihoan2874.techhub.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.backend-url}")
    private String backendUrl;

    @Async
    public void sendEmail(String to, String subject, String content, boolean isHtml) {
        if (to == null || to.trim().isEmpty() || !to.contains("@")) {
            log.warn("Invalid email address '{}'. Skipping email sending for subject: {}", to, subject);
            return;
        }
        try {
            log.info("Sending email to: {} with subject: {}", to, subject);
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, 
                    MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED, 
                    StandardCharsets.UTF_8.name());

            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(content, isHtml);

            mailSender.send(message);
            log.info("Email sent successfully to: {}", to);
        } catch (Exception e) {
            log.error("CRITICAL: Failed to send email to '{}' with subject '{}'. Reason: {} - {}", 
                      to, subject, e.getClass().getName(), e.getMessage(), e);
        }
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
        String subject = "Đặt lại mật khẩu của bạn - S-Life Health Tech";
        String resetUrl = backendUrl + "/api/v1/auth/reset-password?token=" + token;
        String content = "<h3>Password Reset Request</h3>" +
                "<p>Click the link below to reset your password:</p>" +
                "<a href=\"" + resetUrl + "\">Reset Password</a>" +
                "<p>The link will expire in 1 hour.</p>";
        
        sendEmail(to, subject, content, true);
    }
}
