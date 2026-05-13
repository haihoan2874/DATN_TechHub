package com.haihoan2874.techhub.controller;

import com.haihoan2874.techhub.dto.response.CartResponse;
import com.haihoan2874.techhub.dto.response.VoucherApplyResponse;
import com.haihoan2874.techhub.security.service.UserService;
import com.haihoan2874.techhub.service.CartService;
import com.haihoan2874.techhub.service.VoucherService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/vouchers")
@Tag(name = "Vouchers", description = "Voucher validation endpoints")
@SecurityRequirement(name = "bearer")
public class VoucherController {
    private final VoucherService voucherService;
    private final CartService cartService;
    private final UserService userService;

    @GetMapping("/apply")
    @Operation(summary = "Apply voucher", description = "Validate and calculate discount for current cart")
    public ResponseEntity<VoucherApplyResponse> applyVoucher(@RequestParam String code, Authentication authentication) {
        UUID userId = userService.getCurrentUserId(authentication);
        CartResponse cart = cartService.getCart(userId.toString());
        if (cart.getItems().isEmpty()) {
            throw new IllegalStateException("Giỏ hàng của bạn đang trống");
        }
        return ResponseEntity.ok(voucherService.applyVoucher(code, cart.getTotalPrice()));
    }
}
