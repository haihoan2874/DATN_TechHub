package com.haihoan2874.techhub.controller;

import com.haihoan2874.techhub.service.AIService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;


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
     * @param userQuestion the question from user
     * @return Mono with the AI response
     */
    @PostMapping("/consult")
    @Operation(summary = "Ask S-Life AI Advisor", description = "Send a question to the S-Life AI Advisor for health tech recommendations")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "AI responded successfully"),
        @ApiResponse(responseCode = "500", description = "AI service unavailable")
    })
    public Mono<ResponseEntity<String>> getAdvice(@RequestBody String userQuestion) {
        log.info("Incoming AI question: {}", userQuestion);
        return aiService.getProductAdvice(userQuestion)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    @GetMapping("/hello")
    @Operation(summary = "AI Greeting", description = "Get a friendly greeting from S-Life AI")
    public Mono<String> hello() {
        return Mono.just("Chào bạn! S-Life AI Advisor có thể giúp gì cho bạn trong việc lựa chọn thiết bị theo dõi sức khỏe thông minh?");
    }
}
