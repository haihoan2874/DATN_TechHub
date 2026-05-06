package com.haihoan2874.techhub.dto.request.base;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BaseProductRequest {
    @NotNull(message = "Category Id is required")
    private UUID categoryId;

    @NotBlank(message = "Product name is required")
    @Size(max = 255, message = "Name must be at most 255 characters")
    private String name;

    @NotNull(message = "Product slug is required")
    @Pattern(regexp = "^[a-z0-9-]+$")
    private String slug;

    private String description;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", message = "Price must be greater than or equal to 0")
    private BigDecimal price;

    @Size(max = 500)
    private String imageUrl;

    @Min(value = 0, message = "Stock cannot negative")
    @NotNull(message = "Stock quantity is required")
    private Integer stockQuantity;

    @NotNull(message = "Brand is required")
    private UUID brandId;

    private String specs;
    private String features;
    private String videoUrls;

    private Boolean isActive;
}
