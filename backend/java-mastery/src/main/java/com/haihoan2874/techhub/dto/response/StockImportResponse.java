package com.haihoan2874.techhub.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockImportResponse {
    private UUID id;
    private UUID productId;
    private String productName;   // Tên sản phẩm (join từ products)
    private Integer quantity;
    private BigDecimal importPrice;
    private String note;
    private LocalDateTime importedAt;
    private UUID createdBy;
    private LocalDateTime createdAt;
}
