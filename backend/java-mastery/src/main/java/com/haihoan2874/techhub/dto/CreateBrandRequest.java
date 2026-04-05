package com.haihoan2874.techhub.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateBrandRequest {
    @NotBlank(message = "Brand name is required")
    @Size(max = 100, message = "Name must be at most 100 characters")
    private String name;

    @NotBlank(message = "Brand slug is required")
    @Size(max = 100, message = "Slug must be at most 100 characters")
    private String slug;

    private String description;

    @Size(max = 500)
    private String logoUrl;
}
