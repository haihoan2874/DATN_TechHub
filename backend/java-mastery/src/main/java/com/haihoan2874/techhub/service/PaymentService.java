package com.haihoan2874.techhub.service;

import com.haihoan2874.techhub.configuration.VnPayConfig;
import com.haihoan2874.techhub.util.VnPayUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

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
        
        String vnpIpAddr = VnPayUtil.getIpAddress(request);
        String vnpCreateDate = new SimpleDateFormat("yyyyMMddHHmmss").format(new Date());

        Map<String, String> vnpParams = new HashMap<>();
        vnpParams.put("vnp_Version", vnPayConfig.getVersion());
        vnpParams.put("vnp_Command", vnPayConfig.getCommand());
        vnpParams.put("vnp_TmnCode", vnPayConfig.getTmnCode());
        vnpParams.put("vnp_Amount", String.valueOf(amount * 100)); // VNPay amount is in cents
        vnpParams.put("vnp_CurrCode", "VND");
        vnpParams.put("vnp_TxnRef", txnRef);
        vnpParams.put("vnp_OrderInfo", orderInfo);
        vnpParams.put("vnp_OrderType", "other");
        vnpParams.put("vnp_Locale", "vn");
        vnpParams.put("vnp_ReturnUrl", vnPayConfig.getReturnUrl());
        vnpParams.put("vnp_IpAddr", vnpIpAddr);
        vnpParams.put("vnp_CreateDate", vnpCreateDate);

        // Build Hash Data
        String hashData = VnPayUtil.getHashData(vnpParams);
        String vnpSecureHash = VnPayUtil.hmacSHA512(vnPayConfig.getHashSecret(), hashData);
        
        // Build Query String
        String queryUrl = VnPayUtil.getPaymentQueryString(vnpParams) + "&vnp_SecureHash=" + vnpSecureHash;
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
        String vnpSecureHash = requestParams.get("vnp_SecureHash");
        if (vnpSecureHash == null) return false;

        // Remove hash from params to verify
        Map<String, String> verifyParams = new HashMap<>(requestParams);
        verifyParams.remove("vnp_SecureHash");
        verifyParams.remove("vnp_SecureHashType");

        String hashData = VnPayUtil.getHashData(verifyParams);
        String expectedHash = VnPayUtil.hmacSHA512(vnPayConfig.getHashSecret(), hashData);

        boolean isValid = vnpSecureHash.equalsIgnoreCase(expectedHash);
        String responseCode = requestParams.get("vnp_ResponseCode");
        
        log.info("VNPay payment verification: ID={}, Valid={}, ResponseCode={}", 
                requestParams.get("vnp_TxnRef"), isValid, responseCode);
        
        return isValid && "00".equals(responseCode);
    }
}
