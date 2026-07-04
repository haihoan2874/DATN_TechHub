package com.haihoan2874.techhub.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductFinanceResponse {
    private UUID productId;
    private String productName;
    private int quantityImported;
    private int quantitySold;
    private BigDecimal totalImportCost;
    private BigDecimal totalRevenue;
    private BigDecimal cogs; // Cost of Goods Sold
    private BigDecimal profit;
    
    // Tồn kho hiện tại
    private int currentStock;
    private int reservedStock;
    private BigDecimal currentMac; // Giá vốn bình quân hiện hành (MAC)
    private BigDecimal currentStockValue; // Giá trị tồn kho hiện tại (currentStock * currentMac)
}
