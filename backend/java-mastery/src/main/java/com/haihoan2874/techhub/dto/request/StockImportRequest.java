package com.haihoan2874.techhub.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockImportRequest {

    @NotNull(message = "Product ID is required")
    private UUID productId;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;

    @NotNull(message = "Import price is required")
    @DecimalMin(value = "0.0", message = "Import price must be >= 0")
    private BigDecimal importPrice;


    private String note;

    // Nếu null → hệ thống tự lấy thời điểm hiện tại
    private LocalDateTime importedAt;
}
