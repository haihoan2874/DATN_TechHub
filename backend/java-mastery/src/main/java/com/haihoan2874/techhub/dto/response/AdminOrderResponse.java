package com.haihoan2874.techhub.dto.response;

import com.haihoan2874.techhub.model.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
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
    private String customerPhone;
    private String shippingAddress;
    private int itemCount;
    private String paymentMethod;
    private BigDecimal grossProfit;
    private LocalDateTime createdAt;
    private List<AdminOrderItemResponse> items;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AdminOrderItemResponse {
        private UUID productId;
        private String productName;
        private Integer quantity;
        private BigDecimal price;
        private BigDecimal costPrice;
        private BigDecimal subtotal;
        private BigDecimal grossProfit;
    }
}
