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
        if (amount <= 0) {
            throw new IllegalArgumentException("VNPay amount must be greater than zero");
        }
        
        String vnpIpAddr = VnPayUtil.getIpAddress(request);
        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss", Locale.ROOT);
        formatter.setTimeZone(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
        String vnpCreateDate = formatter.format(cld.getTime());
        cld.add(Calendar.MINUTE, 15);
        String vnpExpireDate = formatter.format(cld.getTime());

        Map<String, String> vnpParams = new HashMap<>();
        vnpParams.put("vnp_Version", requireConfig(vnPayConfig.getVersion(), "vnp.version"));
        vnpParams.put("vnp_Command", requireConfig(vnPayConfig.getCommand(), "vnp.command"));
        vnpParams.put("vnp_TmnCode", requireConfig(vnPayConfig.getTmnCode(), "vnp.tmn-code"));
        vnpParams.put("vnp_Amount", String.valueOf(amount * 100)); // VNPay amount is in cents
        vnpParams.put("vnp_CurrCode", "VND");
        vnpParams.put("vnp_TxnRef", txnRef);
        vnpParams.put("vnp_OrderInfo", orderInfo);
        vnpParams.put("vnp_OrderType", "other");
        vnpParams.put("vnp_Locale", "vn");
        vnpParams.put("vnp_ReturnUrl", requireConfig(vnPayConfig.getReturnUrl(), "vnp.return-url"));
        vnpParams.put("vnp_IpAddr", vnpIpAddr);
        vnpParams.put("vnp_CreateDate", vnpCreateDate);
        vnpParams.put("vnp_ExpireDate", vnpExpireDate);

        // Build Hash Data
        String hashData = VnPayUtil.getHashData(vnpParams);
        String vnpSecureHash = VnPayUtil.hmacSHA512(requireConfig(vnPayConfig.getHashSecret(), "vnp.hash-secret"), hashData);
        
        // Build Query String
        String queryUrl = VnPayUtil.getPaymentQueryString(vnpParams) + "&vnp_SecureHash=" + vnpSecureHash;
        String paymentUrl = requireConfig(vnPayConfig.getPayUrl(), "vnp.pay-url") + "?" + queryUrl;
        
        log.debug("Generated VNPay payment URL for Ref: {}", txnRef);
        return paymentUrl;
    }

    /**
     * Verify payment status from callback request.
     *
     * @param requestParams map of parameters from VNPay callback
     * @return true if payment is successful and signature is valid
     */
    public boolean verifyPayment(Map<String, String> requestParams) {
        boolean isValid = verifySignature(requestParams);
        String responseCode = requestParams.get("vnp_ResponseCode");
        String transactionStatus = requestParams.get("vnp_TransactionStatus");

        log.info("VNPay payment verification: ID={}, Valid={}, ResponseCode={}, TransactionStatus={}",
                requestParams.get("vnp_TxnRef"), isValid, responseCode, transactionStatus);

        return isValid && "00".equals(responseCode) && "00".equals(transactionStatus);
    }

    public boolean verifySignature(Map<String, String> requestParams) {
        String vnpSecureHash = requestParams.get("vnp_SecureHash");
        if (vnpSecureHash == null) {
            return false;
        }

        // Remove hash from params to verify
        Map<String, String> verifyParams = new HashMap<>(requestParams);
        verifyParams.remove("vnp_SecureHash");
        verifyParams.remove("vnp_SecureHashType");

        String hashData = VnPayUtil.getHashData(verifyParams);
        String expectedHash = VnPayUtil.hmacSHA512(requireConfig(vnPayConfig.getHashSecret(), "vnp.hash-secret"), hashData);

        return vnpSecureHash.equalsIgnoreCase(expectedHash);
    }

    private String requireConfig(String value, String propertyName) {
        if (value == null || value.isBlank()) {
            throw new IllegalStateException("Missing VNPay configuration: " + propertyName);
        }
        return value.trim();
    }
}
