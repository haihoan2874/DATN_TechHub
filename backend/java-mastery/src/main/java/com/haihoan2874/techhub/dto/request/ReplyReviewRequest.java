package com.haihoan2874.techhub.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ReplyReviewRequest {
    @NotBlank(message = "Reply content is required")
    @Size(max = 5000, message = "Reply content must not exceed 5000 characters")
    private String content;
}
