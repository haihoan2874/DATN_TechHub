package com.haihoan2874.techhub.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SetDefaultAddressResponse {
    private UUID id;
    private Boolean isDefault;
    private LocalDateTime updatedAt;
}
