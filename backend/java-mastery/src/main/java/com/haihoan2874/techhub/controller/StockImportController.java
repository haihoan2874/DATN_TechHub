package com.haihoan2874.techhub.controller;

import com.haihoan2874.techhub.dto.request.StockImportRequest;
import com.haihoan2874.techhub.dto.response.StockImportResponse;
import com.haihoan2874.techhub.service.StockImportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/admin/stock-imports")
@Tag(name = "Stock Imports", description = "Quản lý nhập kho sản phẩm")
@PreAuthorize("hasRole('ADMIN')")
@SecurityRequirement(name = "bearer")
public class StockImportController {

    private final StockImportService stockImportService;

    @PostMapping
    @Operation(summary = "Tạo phiếu nhập kho",
               description = "Admin tạo phiếu nhập kho mới: cộng số lượng vào kho và cập nhật giá vốn/giá bán")
    public ResponseEntity<StockImportResponse> importStock(
            @Valid @RequestBody StockImportRequest request,
            Authentication authentication) {
        log.info("Admin importing stock for product: {}", request.getProductId());
        return new ResponseEntity<>(stockImportService.importStock(request, authentication), HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(summary = "Lấy toàn bộ lịch sử nhập kho",
               description = "Admin xem toàn bộ các phiếu nhập kho của hệ thống")
    public ResponseEntity<List<StockImportResponse>> getAllImports() {
        return ResponseEntity.ok(stockImportService.getAllImports());
    }

    @GetMapping("/products/{productId}")
    @Operation(summary = "Lấy lịch sử nhập kho theo sản phẩm",
               description = "Admin xem lịch sử tất cả các lần nhập của 1 sản phẩm cụ thể")
    public ResponseEntity<List<StockImportResponse>> getImportsByProduct(@PathVariable UUID productId) {
        return ResponseEntity.ok(stockImportService.getImportsByProduct(productId));
    }
}
