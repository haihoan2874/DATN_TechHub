package com.haihoan2874.techhub.util;

import lombok.AccessLevel;
import lombok.NoArgsConstructor;
import java.util.Locale;

/**
 * Utility for generating URL-friendly slugs.
 */
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class SlugUtil {
    
    public static String generateSlug(String input) {
        if (input == null || input.isEmpty()) {
            return "";
        }
        return input.toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9\\s]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("^-+|-+$", "");
    }
}
