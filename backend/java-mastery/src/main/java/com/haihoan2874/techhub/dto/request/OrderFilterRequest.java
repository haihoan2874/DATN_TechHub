package com.haihoan2874.techhub.dto.request;

import com.haihoan2874.techhub.model.OrderStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OrderFilterRequest {
    @Schema(description = "Filter by order status", defaultValue = "PENDING")
    private OrderStatus status;

    @Builder.Default
    @Schema(defaultValue = "0")
    private Integer pageNo = 0;

    @Builder.Default
    @Schema(defaultValue = "10")
    private Integer pageSize = 10;

    @Builder.Default
    @Schema(defaultValue = "created_at", description = "Sort by field: created_at or updated_at")
    private String sortBy = "created_at";

    @Builder.Default
    @Schema(defaultValue = "desc", description = "Sort order: asc or desc")
    private String sortOrder = "desc";
}
