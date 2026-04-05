package com.haihoan2874.techhub.util;

import jakarta.servlet.http.HttpServletRequest;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;

/**
 * Utility class for VNPay payment gateway integration.
 */
public final class VnPayUtil {
    private VnPayUtil() {
        // Utility class
    }

    /**
     * Hash message with HmacSHA512.
     *
     * @param key secret key
     * @param data message to hash
     * @return hex encoded hash string
     */
    public static String hmacSHA512(String key, String data) {
        if (key == null || data == null) {
            return "";
        }
        try {
            final Mac hmac512 = Mac.getInstance("HmacSHA512");
            byte[] hmacKeyBytes = key.getBytes(StandardCharsets.UTF_8);
            final SecretKeySpec secretKey = new SecretKeySpec(hmacKeyBytes, "HmacSHA512");
            hmac512.init(secretKey);
            byte[] dataBytes = data.getBytes(StandardCharsets.UTF_8);
            byte[] result = hmac512.doFinal(dataBytes);
            StringBuilder sb = new StringBuilder(2 * result.length);
            for (byte b : result) {
                sb.append(String.format("%02x", b & 0xff));
            }
            return sb.toString();
        } catch (Exception ex) {
            return "";
        }
    }

    /**
     * Get IP address of the requester.
     *
     * @param request the HttpServletRequest
     * @return IP address string
     */
    public static String getIpAddress(HttpServletRequest request) {
        String ipAddress;
        try {
            ipAddress = request.getHeader("X-FORWARDED-FOR");
            if (ipAddress == null) {
                ipAddress = request.getRemoteAddr();
            }
        } catch (Exception e) {
            ipAddress = "Invalid IP:" + e.getMessage();
        }
        return ipAddress;
    }

    /**
     * Build query string from map of params.
     *
     * @param data map of params
     * @return query string
     */
    public static String getPaymentQueryString(Map<String, String> data) {
        List<String> fieldNames = new ArrayList<>(data.keySet());
        Collections.sort(fieldNames);
        StringBuilder sb = new StringBuilder();
        Iterator<String> itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = itr.next();
            String fieldValue = data.get(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                sb.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII))
                  .append('=')
                  .append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
                if (itr.hasNext()) {
                    sb.append('&');
                }
            }
        }
        return sb.toString();
    }

    /**
     * Build hash data string from map of params (alphabetical order).
     *
     * @param data map of params
     * @return hash data string
     */
    public static String getHashData(Map<String, String> data) {
        List<String> fieldNames = new ArrayList<>(data.keySet());
        Collections.sort(fieldNames);
        StringBuilder sb = new StringBuilder();
        Iterator<String> itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = itr.next();
            String fieldValue = data.get(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                sb.append(fieldName)
                  .append('=')
                  .append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
                if (itr.hasNext()) {
                    sb.append('&');
                }
            }
        }
        return sb.toString();
    }
}
