package com.haihoan2874.techhub.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartResponse {
    private String userId;
    @Builder.Default
    private List<CartItemResponse> items = new ArrayList<>();
    private BigDecimal totalPrice;
    private Integer totalItems;

    public void calculateTotal() {
        this.totalItems = items.stream().mapToInt(CartItemResponse::getQuantity).sum();
        this.totalPrice = items.stream()
                .map(item -> item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
