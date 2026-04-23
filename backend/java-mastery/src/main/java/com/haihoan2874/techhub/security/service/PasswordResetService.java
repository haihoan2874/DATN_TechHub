package com.haihoan2874.techhub.security.service;

import com.haihoan2874.techhub.model.User;
import com.haihoan2874.techhub.repository.UserRepository;
import com.haihoan2874.techhub.security.dto.ForgotPasswordRequest;
import com.haihoan2874.techhub.security.dto.ResetPasswordRequest;
import com.haihoan2874.techhub.security.dto.VerifyOtpRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Slf4j
public class PasswordResetService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JavaMailSender mailSender;

    @Transactional
    public void sendOtp(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Email không tồn tại trong hệ thống"));

        String otp = String.format("%06d", new Random().nextInt(1000000));
        user.setResetOtp(otp);
        user.setResetOtpExpiry(LocalDateTime.now().plusMinutes(5));
        userRepository.save(user);

        log.info("Mã OTP cho email {}: {}", request.getEmail(), otp);

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("S-Life <noreply@slife.vn>");
            message.setTo(user.getEmail());
            message.setSubject("Mã xác thực đổi mật khẩu S-Life");
            message.setText("Mã xác thực của bạn là: " + otp + ". Mã có hiệu lực trong 5 phút.");
            mailSender.send(message); 
            log.info("Đã gửi Email thành công cho {}", user.getEmail());
        } catch (Exception e) {
            log.error("Lỗi khi gửi mail: {}", e.getMessage());
        }
    }

    public boolean verifyOtp(VerifyOtpRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Email không tồn tại"));

        if (user.getResetOtp() == null || !user.getResetOtp().equals(request.getOtp())) {
            throw new RuntimeException("Mã OTP không chính xác");
        }

        if (user.getResetOtpExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Mã OTP đã hết hạn");
        }

        return true;
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Email không tồn tại"));

        // Xác thực lại OTP một lần nữa để bảo mật
        if (user.getResetOtp() == null || !user.getResetOtp().equals(request.getOtp())) {
            throw new RuntimeException("Xác thực không hợp lệ");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setResetOtp(null);
        user.setResetOtpExpiry(null);
        userRepository.save(user);
        
        log.info("Đã đổi mật khẩu thành công cho email {}", request.getEmail());
    }
}
