package com.haihoan2874.techhub.service;

import com.haihoan2874.techhub.configuration.GeminiConfig;
import com.haihoan2874.techhub.model.Product;
import com.haihoan2874.techhub.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service for Google Gemini AI Advisor integration.
 * Provides product recommendations and technical advice.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AIService {

    private final GeminiConfig geminiConfig;
    private final ProductRepository productRepository;
    private final WebClient geminiWebClient;

    /**
     * Get advice from Gemini AI based on user question and current product context.
     *
     * @param userQuestion the question from the user
     * @return Mono with AI response string
     */
    public Mono<String> getProductAdvice(String userQuestion) {
        log.info("Requesting AI advice for question: {}", userQuestion);

        // 1. Build context from products
        String productContext = buildProductContext();

        // 2. Build system instruction
        String systemInstruction = "Bạn là S-Life AI Advisor, một chuyên gia tư vấn thiết bị Health Tech hàng đầu. " +
                "Dưới đây là danh sách sản phẩm (đồng hồ sức khỏe, cân điện tử, sensor) hiện có của S-Life: \n" + productContext + "\n" +
                "Hãy tư vấn cho khách hàng một cách chuyên nghiệp, tập trung vào các tính năng theo dõi nhịp tim, giấc ngủ, SpO2 và hoạt động thể thao. " +
                "Sử dụng giọng văn nhiệt tình và chuyên sâu như một chuyên gia y tế công nghệ.";

        // 3. Prepare Gemini API Request Body
        Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                        Map.of("role", "user", 
                               "parts", List.of(Map.of("text", systemInstruction + "\n\nKhách hàng hỏi: " + userQuestion)))
                )
        );

        // 4. Call Gemini API
        return geminiWebClient.post()
                .uri(uriBuilder -> uriBuilder
                        .queryParam("key", geminiConfig.getApiKey())
                        .build())
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(Map.class)
                .map(response -> {
                    try {
                        // Path: candidates[0].content.parts[0].text
                        List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
                        Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
                        List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
                        return (String) parts.get(0).get("text");
                    } catch (Exception e) {
                        log.error("Error parsing Gemini AI response: {}", e.getMessage());
                        return "Xin lỗi, tôi đang bận một chút. Bạn vui lòng thử lại sau nhé!";
                    }
                })
                .onErrorResume(e -> {
                    log.error("AI Service Error: {}", e.getMessage());
                    return Mono.just("Hệ thống tư vấn AI hiện không khả dụng. Vui lòng liên hệ hotline để được hỗ trợ trực tiếp.");
                });
    }

    /**
     * Build a string representation of products for AI context.
     */
    private String buildProductContext() {
        List<Product> products = productRepository.findAll();
        return products.stream()
                .filter(Product::getIsActive)
                .map(p -> String.format("- %s: Giá %s VND. Specs: %s", 
                        p.getName(), p.getPrice(), p.getSpecs()))
                .collect(Collectors.joining("\n"));
    }
}
