package com.haihoan2874.techhub.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateOrderRequest {
    private List<ItemRequest> items;
    private UUID shippingAddressId;
    private String paymentMethod;
    private String notes;

    @Data
    public static class ItemRequest {
        private UUID productId;
        private Integer quantity;
    }
}
