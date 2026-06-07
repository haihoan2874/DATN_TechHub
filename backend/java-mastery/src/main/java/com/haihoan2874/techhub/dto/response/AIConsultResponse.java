package com.haihoan2874.techhub.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AIConsultResponse {
    private String answer;

    @Builder.Default
    private List<AISuggestedProductResponse> suggestedProducts = List.of();
}
