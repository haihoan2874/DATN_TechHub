package com.haihoan2874.techhub.service;

import com.haihoan2874.techhub.configuration.VnPayConfig;
import com.haihoan2874.techhub.util.VnPayUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

/**
 * Service for VNPay payment gateway integration.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final VnPayConfig vnPayConfig;

    /**
     * Create payment URL for an order.
     *
     * @param request the HttpServletRequest
     * @param amount the amount to pay
     * @param orderInfo the order description
     * @param txnRef the unique transaction reference (usually order ID)
     * @return the generated VNPay payment URL
     */
    public String createPaymentUrl(HttpServletRequest request, long amount, String orderInfo, String txnRef) {
        log.info("Creating VNPay payment URL for Ref: {}, Amount: {}", txnRef, amount);
        
        String vnp_IpAddr = VnPayUtil.getIpAddress(request);
        String vnp_CreateDate = new SimpleDateFormat("yyyyMMddHHmmss").format(new Date());

        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", vnPayConfig.getVersion());
        vnp_Params.put("vnp_Command", vnPayConfig.getCommand());
        vnp_Params.put("vnp_TmnCode", vnPayConfig.getTmnCode());
        vnp_Params.put("vnp_Amount", String.valueOf(amount * 100)); // VNPay amount is in cents
        vnp_Params.put("vnp_CurrCode", "VND");
        vnp_Params.put("vnp_TxnRef", txnRef);
        vnp_Params.put("vnp_OrderInfo", orderInfo);
        vnp_Params.put("vnp_OrderType", "other");
        vnp_Params.put("vnp_Locale", "vn");
        vnp_Params.put("vnp_ReturnUrl", vnPayConfig.getReturnUrl());
        vnp_Params.put("vnp_IpAddr", vnp_IpAddr);
        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);

        // Build Hash Data
        String hashData = VnPayUtil.getHashData(vnp_Params);
        String vnp_SecureHash = VnPayUtil.hmacSHA512(vnPayConfig.getHashSecret(), hashData);
        
        // Build Query String
        String queryUrl = VnPayUtil.getPaymentQueryString(vnp_Params) + "&vnp_SecureHash=" + vnp_SecureHash;
        String paymentUrl = vnPayConfig.getPayUrl() + "?" + queryUrl;
        
        log.info("Generated VNPay payment URL: {}", paymentUrl);
        return paymentUrl;
    }

    /**
     * Verify payment status from callback request.
     *
     * @param requestParams map of parameters from VNPay callback
     * @return true if payment is successful and signature is valid
     */
    public boolean verifyPayment(Map<String, String> requestParams) {
        String vnp_SecureHash = requestParams.get("vnp_SecureHash");
        if (vnp_SecureHash == null) return false;

        // Remove hash from params to verify
        Map<String, String> verifyParams = new HashMap<>(requestParams);
        verifyParams.remove("vnp_SecureHash");
        verifyParams.remove("vnp_SecureHashType");

        String hashData = VnPayUtil.getHashData(verifyParams);
        String expectedHash = VnPayUtil.hmacSHA512(vnPayConfig.getHashSecret(), hashData);

        boolean isValid = vnp_SecureHash.equalsIgnoreCase(expectedHash);
        String responseCode = requestParams.get("vnp_ResponseCode");
        
        log.info("VNPay payment verification: ID={}, Valid={}, ResponseCode={}", 
                requestParams.get("vnp_TxnRef"), isValid, responseCode);
        
        return isValid && "00".equals(responseCode);
    }
}
