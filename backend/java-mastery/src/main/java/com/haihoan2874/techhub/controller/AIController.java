package com.haihoan2874.techhub.controller;

import com.haihoan2874.techhub.service.AIService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.Map;

/**
 * REST Controller for AI-powered product advisory.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
@Tag(name = "AI", description = "AI product advisory using Gemini 1.5 Flash")
public class AIController {

    private final AIService aiService;

    /**
     * Ask the AI advisor for product recommendations or specifications.
     *
     * @param request the map containing "question"
     * @return Mono with the AI response
     */
    @PostMapping("/advisor")
    @Operation(summary = "Ask AI Advisor", description = "Send a question to the TechHub AI Advisor for product recommendations")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "AI responded successfully"),
        @ApiResponse(responseCode = "500", description = "AI service unavailable")
    })
    public Mono<String> askAdvisor(@RequestBody Map<String, String> request) {
        String question = request.get("question");
        log.info("Incoming AI question: {}", question);
        
        if (question == null || question.isEmpty()) {
            return Mono.just("Chào bạn! TechHub có thể giúp gì cho bạn trong việc chọn Smartphone và phụ kiện?");
        }
        
        return aiService.getProductAdvice(question);
    }
}
