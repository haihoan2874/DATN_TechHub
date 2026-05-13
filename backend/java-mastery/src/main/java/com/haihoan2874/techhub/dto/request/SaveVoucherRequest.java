package com.haihoan2874.techhub.dto.request;

import com.haihoan2874.techhub.model.DiscountType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class SaveVoucherRequest {
    @NotBlank(message = "Voucher code is required")
    private String code;

    @NotNull(message = "Discount type is required")
    private DiscountType discountType;

    @NotNull(message = "Discount value is required")
    @DecimalMin(value = "0.01", message = "Discount value must be greater than 0")
    private BigDecimal discountValue;

    @NotNull(message = "Minimum order amount is required")
    @DecimalMin(value = "0", message = "Minimum order amount must be greater than or equal to 0")
    private BigDecimal minOrderAmount;

    private Integer usageLimit;

    @NotNull(message = "Expiration date is required")
    @Future(message = "Expiration date must be in the future")
    private LocalDateTime expiresAt;

    private Boolean isActive = true;
}
