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
import com.haihoan2874.techhub.util.AIQueryParser;
import com.haihoan2874.techhub.util.AIQueryParser.BudgetRange;
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
 * BỘ NÃO AI CỦA HỆ THỐNG (Triển khai kiến trúc RAG - Sinh văn bản tăng cường truy xuất).
 * Đây là nơi xử lý toàn bộ logic để biến Google Gemini thành nhân viên tư vấn độc quyền của TechHub.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AIService {

    private static final int MAX_CONTEXT_PRODUCTS = 10;
    private static final int MAX_KEYWORD_LOOKUPS = 8;
    private static final int MAX_CONTEXT_FIELD_LENGTH = 420;
    private static final String DEFAULT_UNAVAILABLE_MESSAGE =
            "Hệ thống tư vấn AI hiện chưa khả dụng. Bạn vui lòng thử lại sau hoặc liên hệ nhân viên tư vấn.";

    private final GeminiConfig geminiConfig;
    private final ProductRepository productRepository;
    private final InventoryService inventoryService;
    private final WebClient geminiWebClient;

    /**
     * LUỒNG RAG CHÍNH (Trái tim của chức năng AI)
     * - B2 (Retrieval): Quét câu hỏi, lục Database lấy sản phẩm thật.
     * - B3 (Augmented): Nhét sản phẩm vừa tìm được vào Prompt (Lệnh ngầm).
     * - B4 (Generation): Bắn Prompt sang Google Gemini để nó sinh ra câu văn mượt mà.
     *
     * @param request Yêu cầu tư vấn của khách
     * @return Câu trả lời của AI kèm theo Link các sản phẩm có thật trong kho
     */
    public Mono<AIConsultResponse> getProductAdvice(AIConsultRequest request) {
        String userQuestion = request.getMessage().trim();
        log.info("Requesting AI advice. messageLength={}, productId={}", userQuestion.length(), request.getProductId());

        List<Product> contextProducts = findContextProducts(userQuestion, request.getProductId());

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
                .map(response -> {
                    String rawAnswer = parseGeminiText(response);
                    
                    // Lọc ra các ID sản phẩm do chính AI đề xuất (Rất dễ giải thích: Bắt AI nhả ra ID, mình Regex lấy lại)
                    List<UUID> aiSuggestedIds = new ArrayList<>();
                    Matcher matcher = Pattern.compile("\\[SUGGESTED_IDS:\\s*([^\\]]+)\\]").matcher(rawAnswer);
                    if (matcher.find()) {
                        String idsStr = matcher.group(1);
                        for (String id : idsStr.split(",")) {
                            try { aiSuggestedIds.add(UUID.fromString(id.trim())); } catch (Exception ignored) {}
                        }
                        // Xóa thẻ này khỏi câu trả lời gửi cho user
                        rawAnswer = rawAnswer.replace(matcher.group(0), "").trim();
                    }

                    // Nếu AI không chọn gì, ta tôn trọng và trả về danh sách gợi ý trống
                    List<AISuggestedProductResponse> suggestedProducts = contextProducts.stream()
                            .filter(p -> aiSuggestedIds.contains(p.getId()))
                            .map(this::toSuggestedProductResponse)
                            .toList();

                    return AIConsultResponse.builder()
                            .answer(rawAnswer)
                            .suggestedProducts(suggestedProducts)
                            .build();
                })
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

    /**
     * Kỹ thuật Bóc tách từ khóa & Truy xuất Database (Retrieval).
     * Hàm này là thuốc đặc trị hội chứng "Ảo giác" (Hallucination) của AI:
     * Dùng Regex bắt lấy giá tiền và từ khóa -> Quét Database lấy đúng sản phẩm TỒN TẠI TRONG KHO.
     */
    private List<Product> findContextProducts(String userQuestion, UUID productId) {
        LinkedHashMap<UUID, Product> products = new LinkedHashMap<>();
        BudgetRange budgetRange = AIQueryParser.parseBudgetRange(userQuestion);
        List<String> keywords = AIQueryParser.extractKeywords(userQuestion, MAX_KEYWORD_LOOKUPS);

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
            // Nếu khách đã chỉ định ngân sách rõ ràng, ta KHÔNG MỞ RỘNG TÌM KIẾM bỏ qua ngân sách
            // để tránh việc khách hỏi mua đồng hồ 2 triệu mà AI lại gợi ý đồng hồ 30 triệu.
            return new ArrayList<>(products.values());
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

        // Nếu khách CÓ nhập yêu cầu (giá/từ khóa) nhưng tìm KHÔNG RA -> Không được lấy bừa!
        // Chỉ lấy bừa 10 sản phẩm (Fallback) nếu khách chào hỏi chung chung NHƯNG CÓ Ý ĐỊNH MUA HÀNG.
        if (products.isEmpty() && !budgetRange.hasValue() && keywords.isEmpty()) {
            boolean wantsSuggestion = userQuestion.toLowerCase().matches(".*(tư vấn|gợi ý|mua|xem|top|hot|bán chạy|đồng hồ|smartwatch).*");
            if (wantsSuggestion) {
                productRepository.findActiveProductsForAi(MAX_CONTEXT_PRODUCTS).forEach(product -> products.put(product.getId(), product));
            }
        }

        return new ArrayList<>(products.values());
    }

    /**
     * Kỹ thuật Tiêm Ngữ Cảnh (Prompt Engineering).
     * Nhốt con AI vào một "chiếc hộp": Ép nó đóng vai nhân viên TechHub và CHỈ ĐƯỢC PHÉP tư vấn dựa trên danh sách hàng vừa tìm thấy.
     */
    private String buildPrompt(String userQuestion, List<Product> products) {
        String productContext = products.isEmpty()
                ? "Hiện chưa có sản phẩm phù hợp trong dữ liệu được cung cấp."
                : buildProductContext(products);

        return """
                Bạn là trợ lý AI chuyên nghiệp của cửa hàng đồng hồ thể thao cao cấp S-LIFE (TechHub).
                Nhiệm vụ: Tư vấn nhiệt tình, chi tiết, phân tích chuyên sâu tính năng sản phẩm HOẶC giải đáp thắc mắc về chính sách mua hàng.

                THÔNG TIN CHÍNH SÁCH CỬA HÀNG S-LIFE:
                - Thanh toán: Hỗ trợ thanh toán tiền mặt khi nhận hàng (COD) hoặc thanh toán trực tuyến an toàn qua cổng VNPAY.
                - Giao hàng: Giao hàng tận nơi toàn quốc.
                - Bảo hành & Đổi trả: Cam kết sản phẩm chính hãng, hỗ trợ đổi trả và bảo hành theo quy định của hãng.
                - Nếu khách hỏi về chính sách không có ở trên, hãy đáp lịch sự và mời khách liên hệ hotline để được hỗ trợ.

                QUY TẮC TƯ VẤN SẢN PHẨM (NẾU KHÁCH HỎI MUA HÀNG):
                - Chỉ tư vấn dựa trên danh sách sản phẩm ĐƯỢC CUNG CẤP bên dưới.
                - KHÁCH HAY GÕ SAI CHÍNH TẢ HOẶC THIẾU CHỮ (Ví dụ: khách gõ "polar pacer carbon gray", hãy tự hiểu là "Polar Pacer Pro Carbon Gray"). Bạn phải thông minh nhận diện sản phẩm gần giống nhất trong danh sách để tư vấn!
                - DÙNG MARKDOWN gạch đầu dòng, trình bày thật NGẮN GỌN. CẤM viết văn xuôi dài dòng lan man.
                - Nếu khách hỏi những câu bâng quơ, đánh đố (như hỏi giá nhập, hỏi đối thủ): Hãy từ chối khéo léo và bẻ lái về việc tư vấn đồng hồ thể thao.
                - [QUAN TRỌNG NHẤT]: NẾU VÀ CHỈ NẾU bạn trực tiếp tư vấn và khen ngợi một sản phẩm CỤ THỂ trong danh sách cung cấp, bạn MỚI ĐƯỢC in ra dòng `[SUGGESTED_IDS: <id-1>]` ở cuối cùng. 
                - Nếu khách chỉ hỏi thông tin chung chung, hỏi phần mềm, hỏi kết nối, hoặc danh sách cung cấp không có: TUYỆT ĐỐI KHÔNG in ra thẻ `[SUGGESTED_IDS]`. Trả lời ngắn gọn và dừng lại.

                Sản phẩm S-LIFE hiện có:
                %s

                Khách hàng: %s
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

    private AISuggestedProductResponse toSuggestedProductResponse(Product product) {
        return AISuggestedProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .slug(product.getSlug())
                .price(product.getPrice())
                .imageUrl(product.getImageUrl())
                .stockQuantity(inventoryService.getAvailableStock(product.getId()))
                .build();
    }

    private String buildProductContext(List<Product> products) {
        NumberFormat currencyFormat = NumberFormat.getNumberInstance(Locale.forLanguageTag("vi-VN"));

        return products.stream()
                .map(product -> {
                    String price = product.getPrice() == null ? "Chưa cập nhật" : currencyFormat.format(product.getPrice()) + " VND";
                    int stock = inventoryService.getAvailableStock(product.getId());
                    return "ID: %s | Tên: %s | Giá: %s | Tồn kho: %s | Mô tả: %s | Thông số: %s"
                            .formatted(
                                    product.getId(),
                                    product.getName(),
                                    price,
                                    stock,
                                    compact(product.getDescription()),
                                    compact(product.getSpecs())
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
}
