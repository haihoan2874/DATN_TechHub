package com.haihoan2874.techhub.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductItemResponse {
    private UUID id;
    private UUID productId;
    private String productName;
    private UUID stockImportId;
    private String serialNumber;
    private String status;
    private UUID orderId;
    private String orderNumber;
    private LocalDateTime createdAt;
}
