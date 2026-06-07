package com.haihoan2874.techhub.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AIConsultRequest {
    @NotBlank(message = "Nội dung tư vấn không được để trống")
    @Size(max = 800, message = "Nội dung tư vấn không được vượt quá 800 ký tự")
    private String message;

    private UUID productId;
}
