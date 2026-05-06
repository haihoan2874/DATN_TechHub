package com.haihoan2874.techhub.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Sort;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductFilter {
    private UUID categoryId;
    private UUID brandId;
    private String name;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private Boolean isActive;
    private String sortBy;
    private Sort.Direction sortDirection;
}

