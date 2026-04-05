package com.haihoan2874.techhub.dto.response;

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
public class CreateProductResponse {
    private UUID id;
    private UUID categoryId;
    private UUID brandId;
    private String categoryName;
    private String name;
    private String slug;
    private String description;
    private BigDecimal price;
    private String imageUrl;
    private Integer stockQuantity;
    private Boolean isActive;
    private String specs;
    private String videoUrls;
    private LocalDateTime createdAt;
    private UUID createdBy;
}
