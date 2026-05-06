package com.haihoan2874.techhub.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {
    private BigDecimal totalRevenue;
    private long totalOrders;
    private long totalCustomers;
    private long totalProducts;
    
    private List<RevenueByDay> weeklyRevenue;
    private List<CategorySale> topCategories;
    
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
}
