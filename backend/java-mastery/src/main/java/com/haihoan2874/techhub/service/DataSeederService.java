package com.haihoan2874.techhub.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.haihoan2874.techhub.model.*;
import com.haihoan2874.techhub.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import jakarta.annotation.PostConstruct;
import java.io.InputStream;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class DataSeederService {

    private final ProductRepository productRepository;
    private final BrandRepository brandRepository;
    private final CategoryRepository categoryRepository;
    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;
    private final PasswordEncoder passwordEncoder;

    // In-memory caches to avoid redundant DB hits during seeding
    private final Map<String, Brand> brandCache = new HashMap<>();
    private final Map<String, Category> categoryCache = new HashMap<>();
    private final Map<String, UUID> crawlerIdToDbUuidMap = new HashMap<>();
    private final Map<String, User> dummyUserCache = new HashMap<>();

    public void seedAll() {
        log.info("🚀 Bắt đầu quá trình Seeding dữ liệu S-Life...");

        initCaches();

        try {
            seedProducts();
        } catch (Exception e) {
            log.error("❌ Lỗi nghiêm trọng khi seed sản phẩm: {}", e.getMessage(), e);
        }

        try {
            seedReviews();
        } catch (Exception e) {
            log.error("❌ Lỗi nghiêm trọng khi seed đánh giá: {}", e.getMessage(), e);
        }

        log.info("✅ Quá trình Seeding kết thúc! Tổng: {} sản phẩm, {} reviews.",
                productRepository.count(), reviewRepository.count());
    }

    @PostConstruct
    public void initCaches() {
        brandCache.clear();
        categoryCache.clear();
        crawlerIdToDbUuidMap.clear();
        dummyUserCache.clear();

        brandRepository.findAll().forEach(b -> brandCache.put(b.getName().trim(), b));
        categoryRepository.findAll().forEach(c -> categoryCache.put(c.getName().trim(), c));
        userRepository.findAll().forEach(u -> {
            if (u.getUsername() != null) dummyUserCache.put(u.getUsername().toLowerCase(), u);
        });

        // Đảm bảo tài khoản admin luôn có password là admin123 (Tránh lỗi seed SQL)
        userRepository.findByUsername("admin").ifPresent(admin -> {
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setEmail("admin@slife.com"); // Đảm bảo email đúng
            userRepository.save(admin);
            log.info("🛡️ Đã cập nhật/reset mật khẩu Admin về: admin123");
        });

        log.info("📂 Cache: {} brands, {} categories, {} users.", brandCache.size(), categoryCache.size(), dummyUserCache.size());
    }

    // ─── Products ────────────────────────────────────────────────────────────────

    private void seedProducts() throws Exception {
        InputStream inputStream = new ClassPathResource("seed/products_slife.json").getInputStream();
        List<Map<String, Object>> productsData = objectMapper.readValue(inputStream, new TypeReference<>() {});

        log.info("📦 Đang đổ {} sản phẩm vào cơ sở dữ liệu...", productsData.size());
        int saved = 0, skipped = 0;

        for (Map<String, Object> data : productsData) {
            try {
                String crawlerId = (String) data.get("id");

                // Skip if already seeded (idempotent)
                if (crawlerIdToDbUuidMap.containsKey(crawlerId)) {
                    skipped++;
                    continue;
                }

                Brand brand = getOrCreateBrand((String) data.get("brand"));
                Category category = getOrCreateCategory((String) data.get("category"));

                String name = (String) data.get("name");
                String slug = buildUniqueSlug(name);

                Product product = Product.builder()
                        .name(name)
                        .slug(slug)
                        .brandId(brand.getId())
                        .categoryId(category.getId())
                        .price(new BigDecimal(data.get("price").toString()))
                        .description((String) data.get("description"))
                        .imageUrl((String) data.get("image"))
                        .stockQuantity(100)
                        .isActive(true)
                        .specs(data.get("specs") != null ? objectMapper.writeValueAsString(data.get("specs")) : "{}")
                        .features(data.get("features") != null ? objectMapper.writeValueAsString(data.get("features")) : "[]")
                        .build();

                Product savedProduct = productRepository.save(product);
                crawlerIdToDbUuidMap.put(crawlerId, savedProduct.getId());
                saved++;
            } catch (Exception e) {
                log.warn("⚠️ Bỏ qua sản phẩm lỗi [{}]: {}", data.get("id"), e.getMessage());
                skipped++;
            }
        }

        log.info("📦 Sản phẩm: {} đã lưu, {} bỏ qua.", saved, skipped);
    }

    // ─── Reviews ─────────────────────────────────────────────────────────────────

    private void seedReviews() throws Exception {
        InputStream inputStream = new ClassPathResource("seed/reviews_slife.json").getInputStream();
        List<Map<String, Object>> reviewsData = objectMapper.readValue(inputStream, new TypeReference<>() {});

        log.info("⭐ Đang đổ {} đánh giá sản phẩm...", reviewsData.size());
        int saved = 0, skipped = 0;

        // Build a per-product review counter to detect duplicates within batch
        // Key: "productId-username" → already inserted
        Map<String, Boolean> insertedKey = new HashMap<>();

        for (Map<String, Object> data : reviewsData) {
            try {
                String crawlerId = (String) data.get("productId");
                UUID dbProductId = crawlerIdToDbUuidMap.get(crawlerId);

                if (dbProductId == null) {
                    skipped++;
                    continue;
                }

                String userName = (String) data.get("userName");
                if (userName == null || userName.isBlank()) userName = "anonymous";

                String dedupeKey = dbProductId + "::" + userName.toLowerCase();
                if (insertedKey.containsKey(dedupeKey)) {
                    skipped++;
                    continue;
                }

                User reviewer = getOrCreateDummyUser(userName);
                Product product = productRepository.getReferenceById(dbProductId);

                Object ratingObj = data.get("rating");
                int rating = (ratingObj instanceof Number) ? ((Number) ratingObj).intValue() : 5;
                rating = Math.max(1, Math.min(5, rating));

                Review review = Review.builder()
                        .product(product)
                        .user(reviewer)
                        .rating(rating)
                        .comment((String) data.get("comment"))
                        .build();

                reviewRepository.save(review);
                insertedKey.put(dedupeKey, true);
                saved++;
            } catch (Exception e) {
                log.warn("⚠️ Bỏ qua review lỗi: {}", e.getMessage());
                skipped++;
            }
        }

        log.info("⭐ Reviews: {} đã lưu, {} bỏ qua.", saved, skipped);
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────────

    private String buildUniqueSlug(String name) {
        String base = name.toLowerCase()
                .replaceAll("[àáảãạăắặẳẵặâấầẩẫậ]", "a")
                .replaceAll("[èéẻẽẹêếềểễệ]", "e")
                .replaceAll("[ìíỉĩị]", "i")
                .replaceAll("[òóỏõọôốồổỗộơớờởỡợ]", "o")
                .replaceAll("[ùúủũụưứừửữự]", "u")
                .replaceAll("[ỳýỷỹỵ]", "y")
                .replaceAll("[đ]", "d")
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-")
                .replaceAll("^-|-$", "");

        String slug = base;
        int retry = 0;
        while (productRepository.existsBySlug(slug) && retry < 10) {
            slug = base + "-" + UUID.randomUUID().toString().substring(0, 6);
            retry++;
        }
        return slug;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public Brand getOrCreateBrand(String name) {
        if (name == null || name.isBlank()) name = "Khác";
        String cleanName = name.trim();
        if (brandCache.containsKey(cleanName)) return brandCache.get(cleanName);

        Brand brand = brandRepository.findByName(cleanName).orElseGet(() -> {
            String slug = buildBrandSlug(cleanName);
            return brandRepository.saveAndFlush(Brand.builder()
                    .name(cleanName).slug(slug).isActive(true).build());
        });
        brandCache.put(cleanName, brand);
        return brand;
    }

    // Category metadata — description + icon for well-known categories
    private static final Map<String, String> CATEGORY_DESCRIPTIONS = Map.of(
            "Đồng hồ thể thao", "Bộ sưu tập đồng hồ thông minh thể thao chính hãng từ Amazfit, Garmin, Samsung — GPS chính xác, theo dõi sức khỏe 24/7.",
            "Phụ kiện đồng hồ", "Dây đeo, đế sạc, nhẫn thông minh và phụ kiện chính hãng cho smartwatch — chất lượng cao, giá tốt.",
            "Vòng theo dõi sức khỏe", "Vòng đeo tay thông minh theo dõi bước chân, nhịp tim, SpO2 và giấc ngủ — nhỏ gọn, pin trâu, giá rẻ."
    );

    private static final Map<String, String> CATEGORY_ICONS = Map.of(
            "Đồng hồ thể thao", "Watch",
            "Phụ kiện đồng hồ", "Cable",
            "Vòng theo dõi sức khỏe", "Activity"
    );

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public Category getOrCreateCategory(String name) {
        if (name == null || name.isBlank()) name = "Khác";
        String cleanName = name.trim();

        // Check cache first, but still run repair logic
        Category category;
        if (categoryCache.containsKey(cleanName)) {
            category = categoryCache.get(cleanName);
        } else {
            category = categoryRepository.findByName(cleanName).orElseGet(() -> {
                String slug = buildVietnameseSlug(cleanName);
                if (categoryRepository.existsBySlug(slug))
                    slug = slug + "-" + UUID.randomUUID().toString().substring(0, 5);
                return categoryRepository.saveAndFlush(Category.builder()
                        .name(cleanName)
                        .slug(slug)
                        .description(CATEGORY_DESCRIPTIONS.getOrDefault(cleanName, "Khám phá bộ sưu tập " + cleanName + " tại S-Life."))
                        .icon(CATEGORY_ICONS.getOrDefault(cleanName, "Tag"))
                        .isActive(true)
                        .build());
            });
        }

        // Repair existing category if description/icon/slug is missing or broken
        boolean updated = false;
        if (category.getDescription() == null || category.getDescription().isBlank()) {
            category.setDescription(CATEGORY_DESCRIPTIONS.getOrDefault(cleanName, "Khám phá bộ sưu tập " + cleanName + " tại S-Life."));
            updated = true;
        }
        if (category.getIcon() == null || category.getIcon().isBlank()) {
            category.setIcon(CATEGORY_ICONS.getOrDefault(cleanName, "Tag"));
            updated = true;
        }
        String expectedSlug = buildVietnameseSlug(cleanName);
        if (!expectedSlug.equals(category.getSlug()) && !categoryRepository.existsBySlug(expectedSlug)) {
            category.setSlug(expectedSlug);
            updated = true;
        }
        if (updated) {
            category = categoryRepository.saveAndFlush(category);
            log.info("🔧 Đã sửa category: {} → slug={}, desc=✓, icon={}", cleanName, category.getSlug(), category.getIcon());
        }

        categoryCache.put(cleanName, category);
        return category;
    }

    private String buildVietnameseSlug(String name) {
        return name.toLowerCase()
                .replaceAll("[àáảãạăắặẳẵặâấầẩẫậ]", "a")
                .replaceAll("[èéẻẽẹêếềểễệ]", "e")
                .replaceAll("[ìíỉĩị]", "i")
                .replaceAll("[òóỏõọôốồổỗộơớờởỡợ]", "o")
                .replaceAll("[ùúủũụưứừửữự]", "u")
                .replaceAll("[ỳýỷỹỵ]", "y")
                .replaceAll("[đ]", "d")
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-")
                .replaceAll("^-|-$", "");
    }

    /**
     * Creates a lightweight dummy user per unique reviewer name.
     * Uses a deterministic fake email to avoid duplicates across runs.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public User getOrCreateDummyUser(String displayName) {
        String rawKey = displayName.toLowerCase().replaceAll("\\s+", "").replaceAll("[^a-z0-9]", "");
        final String finalKey = rawKey.isBlank() ? "user" + UUID.randomUUID().toString().substring(0, 6) : rawKey;

        if (dummyUserCache.containsKey(finalKey)) return dummyUserCache.get(finalKey);

        String fakeEmail = "seed." + finalKey + "@slife.local";
        User user = userRepository.findByEmail(fakeEmail).orElseGet(() -> {
            String uniqueUsername = buildUniqueUsername(finalKey);
            return userRepository.saveAndFlush(User.builder()
                    .username(uniqueUsername)
                    .email(fakeEmail)
                    .password(passwordEncoder.encode("seed@123"))
                    .firstName(displayName.contains(" ") ? displayName.substring(0, displayName.lastIndexOf(" ")) : displayName)
                    .lastName(displayName.contains(" ") ? displayName.substring(displayName.lastIndexOf(" ") + 1) : "")
                    .role(UserRole.ROLE_USER)
                    .isActive(true)
                    .build());
        });
        dummyUserCache.put(finalKey, user);
        return user;
    }

    private String buildBrandSlug(String name) {
        String slug = name.toLowerCase().replace(" ", "-").replaceAll("[^a-z0-9-]", "");
        if (brandRepository.existsBySlug(slug))
            slug = slug + "-" + UUID.randomUUID().toString().substring(0, 5);
        return slug;
    }

    private String buildUniqueUsername(String base) {
        String candidate = base + UUID.randomUUID().toString().substring(0, 4);
        int attempts = 0;
        while (userRepository.existsByUsername(candidate) && attempts < 10) {
            candidate = base + UUID.randomUUID().toString().substring(0, 6);
            attempts++;
        }
        return candidate;
    }
}
