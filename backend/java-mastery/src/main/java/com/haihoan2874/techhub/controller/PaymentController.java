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
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
    @GetMapping("/vnpay-callback")
    @Operation(summary = "VNPay callback", description = "Handle VNPay return URL callback")
    public ResponseEntity<String> vnpayCallback(@RequestParam Map<String, String> queryParams) {
        log.info("VNPay callback received: {}", queryParams);
        boolean isSuccess = paymentService.verifyPayment(queryParams);
        if (isSuccess) {
            String orderNumber = queryParams.get("vnp_TxnRef");
            log.info("VNPay payment SUCCESS for Ref: {}", orderNumber);
            orderService.processPaymentSuccess(orderNumber);
            return ResponseEntity.ok("Payment Success");
        } else {
            log.warn("VNPay payment FAILED or INVALID for Ref: {}", queryParams.get("vnp_TxnRef"));
            return ResponseEntity.badRequest().body("Payment Failed or Invalid Signature");
        }
    }
}
