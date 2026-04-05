package com.haihoan2874.techhub.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Response DTO for checkout process.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CheckoutResponse {
    private UUID orderId;
    private String orderNumber;
    private String status;
    private BigDecimal totalAmount;
    private String paymentUrl; // Optional, for VNPAY
    private String message;
}
