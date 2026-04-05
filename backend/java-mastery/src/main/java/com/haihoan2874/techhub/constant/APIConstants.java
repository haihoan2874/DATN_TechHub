package com.haihoan2874.techhub.constant;

import lombok.AccessLevel;
import lombok.NoArgsConstructor;

/**
 * Global constants for API response codes and messages to ensure consistency and PMD compliance.
 */
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class APIConstants {
    
    // Status Codes
    public static final String OK = "200";
    public static final String CREATED = "201";
    public static final String NO_CONTENT = "204";
    public static final String BAD_REQUEST = "400";
    public static final String UNAUTHORIZED = "401";
    public static final String FORBIDDEN = "403";
    public static final String NOT_FOUND = "404";
    
    // Common Messages
    public static final String MSG_UNAUTHORIZED = "Unauthorized";
    public static final String MSG_NOT_FOUND = "Resource not found";
    public static final String MSG_PRODUCT_NOT_FOUND = "Product not found";
    public static final String MSG_ORDER_NOT_FOUND = "Order not found";
    
    // Security
    public static final String BEARER = "bearer";
    public static final String ROLE_ADMIN = "hasRole('ADMIN')";
}
