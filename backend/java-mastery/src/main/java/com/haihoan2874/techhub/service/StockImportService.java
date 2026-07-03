package com.haihoan2874.techhub.service;

import com.haihoan2874.techhub.dto.request.StockImportRequest;
import com.haihoan2874.techhub.dto.response.StockImportResponse;
import com.haihoan2874.techhub.model.Inventory;
import com.haihoan2874.techhub.model.Product;
import com.haihoan2874.techhub.model.StockImport;
import com.haihoan2874.techhub.model.User;
import com.haihoan2874.techhub.repository.InventoryRepository;
import com.haihoan2874.techhub.repository.ProductRepository;
import com.haihoan2874.techhub.repository.StockImportRepository;
import com.haihoan2874.techhub.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.math.BigDecimal;
import java.math.RoundingMode;

@Slf4j
@Service
@RequiredArgsConstructor
public class StockImportService {

    private final StockImportRepository stockImportRepository;
    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final UserRepository userRepository;

    /**
     * Tạo phiếu nhập kho mới.
     * Logic:
     * 1. Lưu dòng mới vào stock_imports
     * 2. Cộng số lượng vào inventory.quantity_available
     * 3. Cập nhật inventory.last_restock_date
     * 4. Cập nhật products.cost_price = import_price (giá vốn hiện tại)
     * 5. Cập nhật products.price = selling_price (giá bán mới đề xuất)
     */
    @Transactional
    public StockImportResponse importStock(StockImportRequest request, Authentication authentication) {
        // Kiểm tra sản phẩm tồn tại
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new EntityNotFoundException("Product not found: " + request.getProductId()));

        // Kiểm tra kho tồn tại
        Inventory inventory = inventoryRepository.findByProductId(request.getProductId())
                .orElseThrow(() -> new EntityNotFoundException("Inventory not found for product: " + request.getProductId()));

        // Lấy ID của Admin đang thực hiện
        User admin = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new EntityNotFoundException("Admin not found"));

        LocalDateTime importedAt = request.getImportedAt() != null
                ? request.getImportedAt()
                : LocalDateTime.now();

        // 1. Lưu phiếu nhập kho
        StockImport stockImport = StockImport.builder()
                .productId(product.getId())
                .quantity(request.getQuantity())
                .importPrice(request.getImportPrice())
                .note(request.getNote())
                .importedAt(importedAt)
                .createdBy(admin.getId())
                .build();
        stockImportRepository.save(stockImport);

        // 2 & 3. Tính toán Bình quân gia quyền (MAC) TRƯỚC KHI cộng dồn số lượng
        // Phải cộng cả Hàng đang giữ (Reserved) để tính đúng tổng giá trị thực tế trong kho
        int oldQty = inventory.getQuantityAvailable() + inventory.getQuantityReserved();
        BigDecimal oldCost = product.getCostPrice() != null ? product.getCostPrice() : BigDecimal.ZERO;
        
        int newQty = request.getQuantity();
        BigDecimal newCost = request.getImportPrice();
        
        int totalQty = oldQty + newQty;
        
        // MAC = ((oldQty * oldCost) + (newQty * newCost)) / totalQty
        BigDecimal totalOldValue = oldCost.multiply(BigDecimal.valueOf(oldQty));
        BigDecimal totalNewValue = newCost.multiply(BigDecimal.valueOf(newQty));
        
        BigDecimal newAvgCost = totalOldValue.add(totalNewValue)
                .divide(BigDecimal.valueOf(totalQty), 2, RoundingMode.HALF_UP);
                
        // Cập nhật số lượng và ngày nhập kho
        inventory.setQuantityAvailable(inventory.getQuantityAvailable() + request.getQuantity());
        inventory.setLastRestockDate(importedAt);
        inventoryRepository.save(inventory);

        // 4. Cập nhật Giá vốn Bình quân gia quyền (MAC) lên sản phẩm
        product.setCostPrice(newAvgCost);
        productRepository.save(product);

        log.info("Stock imported: product={}, addedQty={}, importPrice={}, newAvgCost={}",
                product.getName(), request.getQuantity(), request.getImportPrice(), newAvgCost);

        return toResponse(stockImport, product.getName());
    }

    /**
     * Lấy toàn bộ lịch sử nhập kho (Admin)
     */
    public List<StockImportResponse> getAllImports() {
        List<StockImport> imports = stockImportRepository.findAllByOrderByImportedAtDesc();
        if (imports.isEmpty()) {
            return List.of();
        }

        List<UUID> productIds = imports.stream()
                .map(StockImport::getProductId)
                .distinct()
                .toList();
        Map<UUID, Product> productsById = productRepository.findProductsByIds(productIds).stream()
                .collect(Collectors.toMap(Product::getId, Function.identity()));

        return imports.stream()
                .map(si -> toResponse(si, productsById.getOrDefault(si.getProductId(), null)))
                .collect(Collectors.toList());
    }

    /**
     * Lấy lịch sử nhập kho theo sản phẩm
     */
    public List<StockImportResponse> getImportsByProduct(UUID productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new EntityNotFoundException("Product not found: " + productId));

        return stockImportRepository.findByProductIdOrderByImportedAtDesc(productId).stream()
                .map(si -> toResponse(si, product.getName()))
                .collect(Collectors.toList());
    }

    // ---- Helper ----
    private StockImportResponse toResponse(StockImport si, Product product) {
        return toResponse(si, product != null ? product.getName() : "Unknown");
    }

    private StockImportResponse toResponse(StockImport si, String productName) {
        return StockImportResponse.builder()
                .id(si.getId())
                .productId(si.getProductId())
                .productName(productName)
                .quantity(si.getQuantity())
                .importPrice(si.getImportPrice())
                .note(si.getNote())
                .importedAt(si.getImportedAt())
                .createdBy(si.getCreatedBy())
                .createdAt(si.getCreatedAt())
                .build();
    }
}
