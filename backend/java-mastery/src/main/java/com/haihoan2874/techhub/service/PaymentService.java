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
     * Khởi tạo đường link thanh toán VNPAY (Gom thông tin đơn hàng và mã hóa chữ ký).
     *
     * @param request HttpServletRequest (dùng để lấy IP thật của người mua theo yêu cầu VNPAY)
     * @param amount Số tiền cần thanh toán (VNĐ)
     * @param orderInfo Mô tả nội dung đơn hàng hiển thị trên cổng thanh toán
     * @param txnRef Mã tham chiếu duy nhất của đơn hàng (TxnRef - Thường là Mã hóa đơn)
     * @return Đường link thanh toán VNPAY hoàn chỉnh đã kèm ổ khóa chữ ký bảo mật (vnp_SecureHash)
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
     * Kiểm tra trạng thái giao dịch (Kiểm tra kép: Không bị hack & Giao dịch thành công).
     * Phải thỏa mãn 2 điều kiện: Chữ ký khớp (verifySignature) và Mã phản hồi trả về là "00".
     *
     * @param requestParams Tất cả tham số VNPAY trả về qua URL (Callback hoặc IPN)
     * @return true nếu thanh toán thành công và an toàn tuyệt đối
     */
    public boolean verifyPayment(Map<String, String> requestParams) {
        boolean isValid = verifySignature(requestParams);
        String responseCode = requestParams.get("vnp_ResponseCode");
        String transactionStatus = requestParams.get("vnp_TransactionStatus");

        log.info("VNPay payment verification: ID={}, Valid={}, ResponseCode={}, TransactionStatus={}",
                requestParams.get("vnp_TxnRef"), isValid, responseCode, transactionStatus);

        return isValid && "00".equals(responseCode) && "00".equals(transactionStatus);
    }

    /**
     * Xác thực chữ ký điện tử (Chốt chặn bảo mật chống hacker sửa đổi dữ liệu).
     * Bóc tách chữ ký gốc ra, sau đó tự tính toán lại chữ ký mới từ dữ liệu còn lại xem có khớp nhau không.
     *
     * @param requestParams Tất cả tham số VNPAY trả về
     * @return true nếu chữ ký khớp (Dữ liệu nguyên bản, không bị giả mạo trên đường truyền)
     */
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
