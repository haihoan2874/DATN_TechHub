package com.haihoan2874.techhub.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdateCategoryRequest {
    @NotBlank(message = "Category name is required")
    @Size(max = 50, message = "Name must be at most 50 characters")
    private String name;

    private String description;

    @Size(max = 255, message = "Icon path must not exceed 255 characters")
    private String icon;

}
