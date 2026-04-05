package com.haihoan2874.techhub.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Request DTO for checkout process.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CheckoutRequest {
    private UUID shippingAddressId;
    private String paymentMethod; // e.g., "COD", "VNPAY"
    private String notes;
    private String voucherCode;
}
