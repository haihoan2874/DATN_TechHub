package com.haihoan2874.techhub.dto.response;

import com.haihoan2874.techhub.model.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminOrderResponse {
    private UUID id;
    private String orderNumber;
    private OrderStatus status;
    private BigDecimal total;
    private String customerName;
    private String customerEmail;
    private int itemCount;
    private String paymentMethod;
    private LocalDateTime createdAt;
}
