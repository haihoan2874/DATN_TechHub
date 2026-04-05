package com.haihoan2874.techhub.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class ProductFilterRequest {
    private UUID categoryId;
    private String name;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    @Schema(defaultValue = "true")
    private Boolean isActive = true;

    @Schema(defaultValue = "0")
    private int pageNo = 0;

    @Schema(defaultValue = "20")
    private int pageSize = 20;

    @Schema(defaultValue = "updatedAt", description = "Sort by field: name, price, or updatedAt")
    private String sortBy = "updatedAt";

    @Schema(defaultValue = "desc", description = "Sort order: asc or desc")
    private String sortOrder = "desc";
}
