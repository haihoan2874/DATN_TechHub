package com.haihoan2874.techhub.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
public class CategoryFilterRequest {
    @Schema(defaultValue = "0")
    private int pageNo = 0;

    @Schema(defaultValue = "10")
    private int pageSize = 10;

    private String filter;
}
