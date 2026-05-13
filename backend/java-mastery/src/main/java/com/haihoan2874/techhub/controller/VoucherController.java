package com.haihoan2874.techhub.controller;

import com.haihoan2874.techhub.dto.request.SaveVoucherRequest;
import com.haihoan2874.techhub.dto.response.CartResponse;
import com.haihoan2874.techhub.dto.response.VoucherApplyResponse;
import com.haihoan2874.techhub.dto.response.VoucherResponse;
import com.haihoan2874.techhub.security.service.UserService;
import com.haihoan2874.techhub.service.CartService;
import com.haihoan2874.techhub.service.VoucherService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
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

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all vouchers", description = "Admin: retrieve all vouchers")
    public ResponseEntity<List<VoucherResponse>> getAllVouchers() {
        return ResponseEntity.ok(voucherService.getAllVouchers());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create voucher", description = "Admin: create a new voucher")
    public ResponseEntity<VoucherResponse> createVoucher(@Valid @RequestBody SaveVoucherRequest request) {
        return ResponseEntity.ok(voucherService.createVoucher(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update voucher", description = "Admin: update an existing voucher")
    public ResponseEntity<VoucherResponse> updateVoucher(@PathVariable UUID id, @Valid @RequestBody SaveVoucherRequest request) {
        return ResponseEntity.ok(voucherService.updateVoucher(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete voucher", description = "Admin: delete a voucher")
    public ResponseEntity<Void> deleteVoucher(@PathVariable UUID id) {
        voucherService.deleteVoucher(id);
        return ResponseEntity.noContent().build();
    }

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
