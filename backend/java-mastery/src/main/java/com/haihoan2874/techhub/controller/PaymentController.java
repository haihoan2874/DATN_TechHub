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
     * Create VNPay payment URL for an order.
     *
     * @param request the HttpServletRequest
     * @param amount the amount to pay (in VND)
     * @param orderId the order ID
     * @return the generated payment URL
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
     * VNPay callback handler.
     *
     * @param queryParams map of parameters from VNPay callback
     * @return payment status message
     */
    /**
     * VNPay gọi về URL này sau khi người dùng hoàn tất thanh toán trên cổng VNPay.
     * Xác minh chữ ký, cập nhật đơn hàng, rồi redirect 302 về giao diện Frontend.
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
            log.warn("VNPay thanh toán THẤT BẠI hoặc chữ ký không hợp lệ cho Ref: {}", queryParams.get("vnp_TxnRef"));
            // Redirect về trang đơn hàng với thông báo thất bại
            redirectUrl = frontendUrl + "/orders?payment=failed";
        }

        return ResponseEntity.status(HttpStatus.FOUND)
                .location(URI.create(redirectUrl))
                .build();
    }

    @GetMapping("/vnpay-ipn")
    @Operation(summary = "VNPay IPN", description = "Server-to-server endpoint để VNPay cập nhật kết quả thanh toán")
    public ResponseEntity<Map<String, String>> vnpayIpn(@RequestParam Map<String, String> queryParams) {
        log.info("VNPay IPN received for Ref: {}", queryParams.get("vnp_TxnRef"));
        return ResponseEntity.ok(orderService.processVnPayIpn(queryParams));
    }
}
