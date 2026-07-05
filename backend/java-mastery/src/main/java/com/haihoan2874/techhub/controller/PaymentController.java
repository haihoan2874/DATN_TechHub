package com.haihoan2874.techhub.controller;

import com.haihoan2874.techhub.service.OrderService;
import com.haihoan2874.techhub.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.Map;

/**
 * REST Controller for payment management.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
@Tag(name = "Payment", description = "Payment gateway integration endpoints")
public class PaymentController {

    private final PaymentService paymentService;
    private final OrderService orderService;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    /**
     * CỬA 1: Xin Link Thanh Toán (Frontend gọi vào đây).
     * Nhận ID Đơn hàng và Số tiền, nhờ Quản đốc (PaymentService) tạo link VNPAY và trả về cho React.
     *
     * @param request HttpServletRequest (Lấy IP khách hàng)
     * @param amount Số tiền cần thanh toán (VNĐ)
     * @param orderId Mã đơn hàng
     * @return URL thanh toán VNPAY (Frontend sẽ tự động mở URL này)
     */
    @SecurityRequirement(name = "bearer")
    @GetMapping("/vnpay-create")
    @Operation(summary = "Create VNPay URL", description = "Generate a secure payment URL for VNPay sandbox")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "URL generated successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<String> createVnPayUrl(
            HttpServletRequest request,
            @RequestParam long amount,
            @RequestParam String orderId) {
        log.info("Request to create VNPay payment URL for Order: {}, Amount: {}", orderId, amount);
        String paymentUrl = paymentService.createPaymentUrl(request, amount, "Thanh toan don hang " + orderId, orderId);
        return ResponseEntity.ok(paymentUrl);
    }

    /**
     * CỬA 2: Đón khách về (VNPay Return URL / Callback).
     * Trình duyệt của khách sẽ tự động bay về API này sau khi thanh toán xong trên web VNPAY.
     * Nhiệm vụ chính: Xác minh chữ ký, Hủy đơn nếu khách tắt ngang, và Bẻ lái (Redirect 302) về Frontend để hiện giao diện Cảm ơn / Báo lỗi.
     *
     * @param queryParams Toàn bộ tham số VNPAY trả về trên URL
     * @return Redirect thẳng về màn hình Frontend (Không trả về JSON)
     */
    @GetMapping("/vnpay-callback")
    @Operation(summary = "VNPay callback", description = "Xử lý kết quả thanh toán từ VNPay và redirect về Frontend")
    public ResponseEntity<Void> vnpayCallback(@RequestParam Map<String, String> queryParams) {
        log.info("VNPay callback received: {}", queryParams);
        boolean isSuccess = paymentService.verifyPayment(queryParams);

        String redirectUrl;
        if (isSuccess) {
            String orderNumber = queryParams.get("vnp_TxnRef");
            log.info("VNPay thanh toán THÀNH CÔNG cho đơn hàng: {}", orderNumber);
            orderService.processPaymentSuccess(orderNumber);
            // Redirect về trang đơn hàng với thông báo thành công
            redirectUrl = frontendUrl + "/orders?payment=success&order=" + orderNumber;
        } else {
            String orderNumber = queryParams.get("vnp_TxnRef");
            log.warn("VNPay thanh toán THẤT BẠI hoặc chữ ký không hợp lệ cho Ref: {}", orderNumber);
            if (orderNumber != null) {
                try {
                    orderService.processPaymentFailed(orderNumber);
                } catch (Exception e) {
                    log.error("Failed to auto-cancel order on payment fail", e);
                }
            }
            // Redirect về trang đơn hàng với thông báo thất bại
            redirectUrl = frontendUrl + "/orders?payment=failed";
        }

        return ResponseEntity.status(HttpStatus.FOUND)
                .location(URI.create(redirectUrl))
                .build();
    }

    /**
     * CỬA 3: Cửa hậu bí mật (VNPay IPN - Server to Server).
     * Server của VNPAY sẽ tự động gọi ngầm vào API này (Khách hàng không hề biết).
     * Đây là TRÁI TIM của hệ thống: Đảm bảo cập nhật trạng thái đơn hàng và trừ kho an toàn 100% kể cả khi khách rớt mạng.
     *
     * @param queryParams Dữ liệu VNPAY gửi sang
     * @return Trả về JSON {"RspCode":"00"} cho VNPAY biết là đã nhận được tin báo
     */
    @GetMapping("/vnpay-ipn")
    @Operation(summary = "VNPay IPN", description = "Server-to-server endpoint để VNPay cập nhật kết quả thanh toán")
    public ResponseEntity<Map<String, String>> vnpayIpn(@RequestParam Map<String, String> queryParams) {
        log.info("VNPay IPN received for Ref: {}", queryParams.get("vnp_TxnRef"));
        return ResponseEntity.ok(orderService.processVnPayIpn(queryParams));
    }
}
