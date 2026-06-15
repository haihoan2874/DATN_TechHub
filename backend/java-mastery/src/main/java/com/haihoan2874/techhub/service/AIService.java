package com.haihoan2874.techhub.service;

import com.haihoan2874.techhub.configuration.GeminiConfig;
import com.haihoan2874.techhub.dto.request.AIConsultRequest;
import com.haihoan2874.techhub.dto.response.AIConsultResponse;
import com.haihoan2874.techhub.dto.response.AISuggestedProductResponse;
import com.haihoan2874.techhub.model.Product;
import com.haihoan2874.techhub.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.Normalizer;
import java.text.NumberFormat;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * Service for Google Gemini AI Advisor integration.
 * Provides product recommendations and technical advice.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AIService {

    private static final int MAX_CONTEXT_PRODUCTS = 10;
    private static final int MAX_KEYWORD_LOOKUPS = 5;
    private static final int MAX_CONTEXT_FIELD_LENGTH = 420;
    private static final Pattern MONEY_PATTERN = Pattern.compile("(\\d+(?:[.,]\\d+)?)\\s*(tr|trieu|trieu dong|triệu|triệu đồng|m|k|nghin|nghìn)?");
    private static final String DEFAULT_UNAVAILABLE_MESSAGE =
            "Hệ thống tư vấn AI hiện chưa khả dụng. Bạn vui lòng thử lại sau hoặc liên hệ nhân viên tư vấn.";

    private final GeminiConfig geminiConfig;
    private final ProductRepository productRepository;
    private final InventoryService inventoryService;
    private final WebClient geminiWebClient;

    public Mono<AIConsultResponse> getProductAdvice(AIConsultRequest request) {
        String userQuestion = request.getMessage().trim();
        log.info("Requesting AI advice. messageLength={}, productId={}", userQuestion.length(), request.getProductId());

        List<Product> contextProducts = findContextProducts(userQuestion, request.getProductId());
        List<AISuggestedProductResponse> suggestedProducts = toSuggestedProducts(contextProducts);

        if (!isGeminiConfigured()) {
            return Mono.just(AIConsultResponse.builder()
                    .answer(DEFAULT_UNAVAILABLE_MESSAGE)
                    .suggestedProducts(List.of())
                    .build());
        }

        String prompt = buildPrompt(userQuestion, contextProducts);
        Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                        Map.of("role", "user",
                                "parts", List.of(Map.of("text", prompt)))
                )
        );

        return geminiWebClient.post()
                .uri(uriBuilder -> uriBuilder
                        .queryParam("key", geminiConfig.getApiKey())
                .build())
                .bodyValue(requestBody)
                .retrieve()
                .onStatus(HttpStatusCode::isError, response -> response.bodyToMono(String.class)
                        .defaultIfEmpty("")
                        .flatMap(errorBody -> {
                            log.error("Gemini API error. status={}, body={}", response.statusCode(), errorBody);
                            return Mono.error(new IllegalStateException("Gemini API error: " + response.statusCode()));
                        }))
                .bodyToMono(Map.class)
                .map(response -> AIConsultResponse.builder()
                        .answer(parseGeminiText(response))
                        .suggestedProducts(suggestedProducts)
                        .build())
                .onErrorResume(e -> {
                    log.error("AI service error: {}", e.getMessage());
                    return Mono.just(AIConsultResponse.builder()
                            .answer(DEFAULT_UNAVAILABLE_MESSAGE)
                            .suggestedProducts(List.of())
                            .build());
                });
    }

    private boolean isGeminiConfigured() {
        String apiKey = geminiConfig.getApiKey();
        return apiKey != null && !apiKey.isBlank() && !apiKey.startsWith("your-");
    }

    private List<Product> findContextProducts(String userQuestion, UUID productId) {
        LinkedHashMap<UUID, Product> products = new LinkedHashMap<>();
        BudgetRange budgetRange = parseBudgetRange(userQuestion);
        List<String> keywords = extractKeywords(userQuestion);

        if (productId != null) {
            productRepository.findById(productId)
                    .filter(product -> Boolean.TRUE.equals(product.getIsActive()))
                    .ifPresent(product -> products.put(product.getId(), product));
        }

        if (budgetRange.hasValue()) {
            List<String> lookupKeywords = keywords.isEmpty() ? List.of((String) null) : keywords;
            for (String keyword : lookupKeywords) {
                if (products.size() >= MAX_CONTEXT_PRODUCTS) {
                    break;
                }

                productRepository.findActiveProductsForAiByBudget(
                        keyword,
                        budgetRange.minPrice(),
                        budgetRange.maxPrice(),
                        MAX_CONTEXT_PRODUCTS
                ).forEach(product -> {
                    if (products.size() < MAX_CONTEXT_PRODUCTS) {
                        products.putIfAbsent(product.getId(), product);
                    }
                });
            }
        }

        for (String keyword : keywords) {
            if (products.size() >= MAX_CONTEXT_PRODUCTS) {
                break;
            }

            productRepository.findActiveProductsForAiByKeyword(keyword, MAX_CONTEXT_PRODUCTS).forEach(product -> {
                if (products.size() < MAX_CONTEXT_PRODUCTS) {
                    products.putIfAbsent(product.getId(), product);
                }
            });
        }

        if (products.isEmpty()) {
            productRepository.findActiveProductsForAi(MAX_CONTEXT_PRODUCTS).forEach(product -> products.put(product.getId(), product));
        }

        return new ArrayList<>(products.values());
    }

    private BudgetRange parseBudgetRange(String message) {
        String normalized = normalizeForSearch(message);
        Matcher matcher = MONEY_PATTERN.matcher(normalized);

        if (!matcher.find()) {
            return BudgetRange.empty();
        }

        BigDecimal amount = parseMoneyAmount(matcher.group(1), matcher.group(2));
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            return BudgetRange.empty();
        }

        if (containsAny(normalized, "tren", "hon", "tu ", ">=", ">")) {
            return new BudgetRange(amount, null);
        }

        if (containsAny(normalized, "duoi", "toi da", "khong qua", "<=", "<", "max")) {
            return new BudgetRange(null, amount);
        }

        if (containsAny(normalized, "tam", "khoang", "co ")) {
            BigDecimal variance = amount.multiply(BigDecimal.valueOf(0.2)).setScale(0, RoundingMode.HALF_UP);
            return new BudgetRange(amount.subtract(variance).max(BigDecimal.ZERO), amount.add(variance));
        }

        return new BudgetRange(null, amount);
    }

    private BigDecimal parseMoneyAmount(String rawNumber, String rawUnit) {
        try {
            BigDecimal value = new BigDecimal(rawNumber.replace(',', '.'));
            String unit = rawUnit == null ? "" : normalizeForSearch(rawUnit);

            if (unit.contains("tr") || unit.equals("m") || unit.contains("trieu")) {
                return value.multiply(BigDecimal.valueOf(1_000_000));
            }

            if (unit.equals("k") || unit.contains("nghin")) {
                return value.multiply(BigDecimal.valueOf(1_000));
            }

            if (value.compareTo(BigDecimal.valueOf(1000)) < 0) {
                return value.multiply(BigDecimal.valueOf(1_000_000));
            }

            return value;
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private boolean containsAny(String value, String... candidates) {
        for (String candidate : candidates) {
            if (value.contains(candidate)) {
                return true;
            }
        }
        return false;
    }

    private List<String> extractKeywords(String message) {
        List<String> keywords = new ArrayList<>();
        String normalizedMessage = message.toLowerCase(Locale.ROOT).replaceAll("[^\\p{L}\\p{N}\\s]", " ");

        for (String candidate : List.of(
                "garmin", "amazfit", "fitbit", "huawei", "polar", "whoop", "coros", "samsung", "apple",
                "đồng hồ", "smartwatch", "vòng đeo", "tai nghe", "phụ kiện",
                "chạy bộ", "gps", "bơi", "thể thao", "giấc ngủ", "spo2", "nhịp tim", "pin"
        )) {
            if (normalizedMessage.contains(candidate)) {
                keywords.add(candidate);
            }
        }

        for (String token : normalizedMessage.split("\\s+")) {
            if (keywords.size() >= MAX_KEYWORD_LOOKUPS) {
                break;
            }
            if (token.length() >= 4 && token.matches(".*\\p{L}.*") && !keywords.contains(token)) {
                keywords.add(token);
            }
        }

        return keywords.stream().limit(MAX_KEYWORD_LOOKUPS).toList();
    }

    private String buildPrompt(String userQuestion, List<Product> products) {
        String productContext = products.isEmpty()
                ? "Hiện chưa có sản phẩm phù hợp trong dữ liệu được cung cấp."
                : buildProductContext(products);

        return """
                Bạn là trợ lý tư vấn mua sắm của S-LIFE, chuyên về thiết bị sức khỏe thông minh.
                Nhiệm vụ: tư vấn ngắn gọn, thực tế, giúp khách hàng chọn sản phẩm phù hợp.

                Quy tắc bắt buộc:
                - Chỉ tư vấn dựa trên danh sách sản phẩm S-LIFE được cung cấp bên dưới.
                - Không bịa tên sản phẩm, giá, tồn kho hoặc thông số ngoài dữ liệu.
                - Không chẩn đoán bệnh hoặc đưa lời khuyên y tế thay bác sĩ.
                - Nếu khách hỏi quá chung chung, hãy hỏi lại tối đa 1 câu ngắn để làm rõ nhu cầu.
                - Ưu tiên sản phẩm còn hàng, đúng ngân sách và đúng nhu cầu sử dụng.
                - Trả lời bằng tiếng Việt, dễ hiểu, 3-6 câu. Nếu có sản phẩm phù hợp, nêu lý do chọn.

                Sản phẩm liên quan:
                %s

                Khách hàng hỏi: %s
                """.formatted(productContext, userQuestion);
    }

    private String parseGeminiText(Map<?, ?> response) {
        try {
            List<?> candidates = (List<?>) response.get("candidates");
            Map<?, ?> candidate = (Map<?, ?>) candidates.getFirst();
            Map<?, ?> content = (Map<?, ?>) candidate.get("content");
            List<?> parts = (List<?>) content.get("parts");
            Map<?, ?> part = (Map<?, ?>) parts.getFirst();
            Object text = part.get("text");

            if (text instanceof String value && !value.isBlank()) {
                return value.trim();
            }
        } catch (Exception e) {
            log.error("Error parsing Gemini response: {}", e.getMessage());
        }

        return "Xin lỗi, tôi chưa thể tạo câu trả lời phù hợp lúc này. Bạn vui lòng thử lại với nhu cầu cụ thể hơn.";
    }

    private List<AISuggestedProductResponse> toSuggestedProducts(List<Product> products) {
        return products.stream()
                .limit(4)
                .map(product -> AISuggestedProductResponse.builder()
                        .id(product.getId())
                        .name(product.getName())
                        .slug(product.getSlug())
                        .price(product.getPrice())
                        .imageUrl(product.getImageUrl())
                        .stockQuantity(inventoryService.getAvailableStock(product.getId()))
                        .build())
                .toList();
    }

    private String buildProductContext(List<Product> products) {
        NumberFormat currencyFormat = NumberFormat.getNumberInstance(Locale.forLanguageTag("vi-VN"));

        return products.stream()
                .map(product -> {
                    String price = product.getPrice() == null ? "Chưa cập nhật" : currencyFormat.format(product.getPrice()) + " VND";
                    int stock = inventoryService.getAvailableStock(product.getId());
                    return "- %s | Giá: %s | Tồn kho: %s | Mô tả: %s | Thông số: %s | Điểm nổi bật: %s"
                            .formatted(
                                    product.getName(),
                                    price,
                                    stock,
                                    compact(product.getDescription()),
                                    compact(product.getSpecs()),
                                    compact(product.getFeatures())
                            );
                })
                .collect(Collectors.joining("\n"));
    }

    private String compact(String value) {
        if (value == null || value.isBlank()) {
            return "Chưa cập nhật";
        }

        String normalized = value.replaceAll("\\s+", " ").trim();
        if (normalized.length() <= MAX_CONTEXT_FIELD_LENGTH) {
            return normalized;
        }

        return normalized.substring(0, MAX_CONTEXT_FIELD_LENGTH) + "...";
    }

    private String normalizeForSearch(String value) {
        if (value == null) {
            return "";
        }

        String normalized = Normalizer.normalize(value, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase(Locale.ROOT);

        return normalized.replaceAll("[^a-z0-9<>=>=.,\\s]", " ").replaceAll("\\s+", " ").trim();
    }

    private record BudgetRange(BigDecimal minPrice, BigDecimal maxPrice) {
        static BudgetRange empty() {
            return new BudgetRange(null, null);
        }

        boolean hasValue() {
            return minPrice != null || maxPrice != null;
        }
    }
}
