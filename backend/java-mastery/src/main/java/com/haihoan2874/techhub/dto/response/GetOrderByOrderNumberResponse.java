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
public class GetOrderByOrderNumberResponse {
    private UUID id;
    private String orderNumber;
    private UUID userId;
    private OrderStatus status;
    private BigDecimal total;
    private String shippingAddress;
    private String paymentMethod;
    private String notes;
    private List<ItemResponse> items;
    private LocalDateTime createdAt;

    @Data
    @Builder
    public static class ItemResponse {
        private UUID id;
        private UUID productId;
        private String productName;
        private Integer quantity;
        private BigDecimal price;
        private BigDecimal subtotal;
    }
}
