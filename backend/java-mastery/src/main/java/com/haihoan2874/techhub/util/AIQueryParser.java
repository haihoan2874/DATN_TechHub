package com.haihoan2874.techhub.util;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.Normalizer;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Tiện ích bóc tách ý định người dùng bằng Regex/Chuỗi.
 * Tách riêng ra đây để AIService.java sạch sẽ và tập trung vào logic gọi AI.
 */
public class AIQueryParser {

    private static final Pattern MONEY_PATTERN = Pattern.compile("(\\d+(?:[.,]\\d+)?)\\s*(tr|trieu|trieu dong|triệu|triệu đồng|m|k|nghin|nghìn)?");

    public record BudgetRange(BigDecimal minPrice, BigDecimal maxPrice) {
        public static BudgetRange empty() {
            return new BudgetRange(null, null);
        }

        public boolean hasValue() {
            return minPrice != null || maxPrice != null;
        }
    }

    public static BudgetRange parseBudgetRange(String message) {
        String normalized = normalizeForSearch(message);
        Matcher matcher = MONEY_PATTERN.matcher(normalized);

        if (!matcher.find()) {
            return BudgetRange.empty();
        }

        BigDecimal amount = parseMoneyAmount(matcher.group(1), matcher.group(2));
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            return BudgetRange.empty();
        }

        // Loại bỏ cụm từ "tu van" và "tu dong" để tránh nhận diện nhầm với "tu " (từ)
        String checkStr = normalized.replaceAll("\\btu\\s+van\\b", "")
                .replaceAll("\\btu\\s+dong\\b", "")
                .replaceAll("\\s+", " ");

        if (containsAny(checkStr, "tren", "hon", "tu ", ">=", ">")) {
            return new BudgetRange(amount, null);
        }

        if (containsAny(checkStr, "duoi", "toi da", "khong qua", "<=", "<", "max")) {
            return new BudgetRange(null, amount);
        }

        if (containsAny(checkStr, "tam", "khoang", "co ")) {
            BigDecimal variance = amount.multiply(BigDecimal.valueOf(0.2)).setScale(0, RoundingMode.HALF_UP);
            return new BudgetRange(amount.subtract(variance).max(BigDecimal.ZERO), amount.add(variance));
        }

        return new BudgetRange(null, amount);
    }

    private static BigDecimal parseMoneyAmount(String rawNumber, String rawUnit) {
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

    private static boolean containsAny(String value, String... candidates) {
        for (String candidate : candidates) {
            if (value.contains(candidate)) {
                return true;
            }
        }
        return false;
    }

    public static List<String> extractKeywords(String message, int limit) {
        List<String> keywords = new ArrayList<>();
        String normalizedMessage = message.toLowerCase(Locale.ROOT).replaceAll("[^\\p{L}\\p{N}\\s]", " ").trim();

        if (!normalizedMessage.isBlank() && normalizedMessage.split("\\s+").length <= 8) {
            keywords.add(normalizedMessage);
        }

        List<String> genericTerms = List.of(
                "garmin", "amazfit", "fitbit", "huawei", "polar", "whoop", "coros", "samsung", "apple",
                "đồng hồ", "smartwatch", "vòng đeo", "tai nghe", "phụ kiện",
                "chạy bộ", "gps", "bơi", "thể thao", "giấc ngủ", "spo2", "nhịp tim", "pin"
        );

        for (String token : normalizedMessage.split("\\s+")) {
            if (token.length() >= 2 && token.matches(".*\\p{L}.*|.*\\d.*") 
                && !genericTerms.contains(token) 
                && !keywords.contains(token)) {
                keywords.add(token);
            }
        }

        for (String candidate : genericTerms) {
            if (normalizedMessage.contains(candidate) && !keywords.contains(candidate)) {
                keywords.add(candidate);
            }
        }

        return keywords.stream().limit(limit).toList();
    }

    public static String normalizeForSearch(String value) {
        if (value == null) {
            return "";
        }

        // Thay thế thủ công đ/Đ để giữ lại ký tự 'd' trước khi NFD loại bỏ dấu
        value = value.replace('đ', 'd').replace('Đ', 'D');

        String normalized = Normalizer.normalize(value, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase(Locale.ROOT);

        return normalized.replaceAll("[^a-z0-9<>=>=.,\\s]", " ").replaceAll("\\s+", " ").trim();
    }
}
