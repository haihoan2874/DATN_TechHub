package com.haihoan2874.techhub.dto.response;

import com.haihoan2874.techhub.model.OrderStatus;
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
public class PatchCancelOrderResponse {
    private UUID id;
    private String orderNumber;
    private OrderStatus status;
    private LocalDateTime updatedAt;
}
