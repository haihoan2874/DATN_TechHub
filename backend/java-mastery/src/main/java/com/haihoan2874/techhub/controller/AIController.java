package com.haihoan2874.techhub.controller;

import com.haihoan2874.techhub.dto.request.AIConsultRequest;
import com.haihoan2874.techhub.dto.response.AIConsultResponse;
import com.haihoan2874.techhub.service.AIService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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
@PreAuthorize("isAuthenticated()")
public class AIController {

    private final AIService aiService;

    /**
     * BƯỚC 1: TIẾP NHẬN YÊU CẦU (Nhận câu hỏi từ Frontend).
     * API này hứng câu chat của khách hàng. Nó đóng vai trò như cô lễ tân ghi nhận nhu cầu của khách.
     *
     * @param request Chứa đoạn chat của khách (VD: "Tìm cho tôi đồng hồ 10 triệu để chạy bộ")
     * @return Dữ liệu JSON chứa câu trả lời mượt mà của AI và Danh sách link sản phẩm gợi ý
     */
    @PostMapping("/consult")
    @Operation(summary = "Ask S-Life AI Advisor", description = "Send a question to the S-Life AI Advisor for health tech recommendations")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "AI responded successfully"),
        @ApiResponse(responseCode = "500", description = "AI service unavailable")
    })
    public Mono<ResponseEntity<AIConsultResponse>> getAdvice(@Valid @RequestBody AIConsultRequest request) {
        log.info("Incoming AI question. messageLength={}, productId={}",
                request.getMessage() == null ? 0 : request.getMessage().length(),
                request.getProductId());
        return aiService.getProductAdvice(request)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    @GetMapping("/hello")
    @Operation(summary = "AI Greeting", description = "Get a friendly greeting from S-Life AI")
    public Mono<String> hello() {
        return Mono.just("Chào bạn! S-Life AI Advisor có thể giúp gì cho bạn trong việc lựa chọn thiết bị theo dõi sức khỏe thông minh?");
    }
}
