package com.haihoan2874.techhub.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {
    private String range;
    private String rangeLabel;
    private BigDecimal totalRevenue;
    private BigDecimal totalProfit;
    private long totalOrders;
    private long totalCustomers;
    private long totalProducts;
    
    private List<RevenueByDay> weeklyRevenue;
    private List<CategorySale> topCategories;
    private List<OrderStatusSummary> orderStatuses;
    private List<ProductSale> topProducts;
    private List<LowStockProduct> lowStockProducts;
    
    @Data
    @AllArgsConstructor
    public static class RevenueByDay {
        private String day;
        private BigDecimal value;
    }
    
    @Data
    @AllArgsConstructor
    public static class CategorySale {
        private String name;
        private long value;
        private String color;
    }

    @Data
    @AllArgsConstructor
    public static class OrderStatusSummary {
        private String status;
        private long count;
    }

    @Data
    @AllArgsConstructor
    public static class ProductSale {
        private String id;
        private String name;
        private String imageUrl;
        private long quantity;
        private BigDecimal revenue;
        private BigDecimal profit;
    }

    @Data
    @AllArgsConstructor
    public static class LowStockProduct {
        private String name;
        private String imageUrl;
        private int stockQuantity;
    }
}
