package com.haihoan2874.techhub.configuration;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration class for VNPay payment gateway.
 */
@Getter
@Configuration
public class VnPayConfig {

    @Value("${vnp.tmn-code}")
    private String tmnCode;

    @Value("${vnp.hash-secret}")
    private String hashSecret;

    @Value("${vnp.pay-url}")
    private String payUrl;

    @Value("${vnp.return-url}")
    private String returnUrl;

    @Value("${vnp.version}")
    private String version;

    @Value("${vnp.command}")
    private String command;

}
