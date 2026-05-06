package com.haihoan2874.techhub.service;

import com.haihoan2874.techhub.dto.response.DashboardStatsResponse;
import com.haihoan2874.techhub.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    public DashboardStatsResponse getDashboardStats() {
        // 1. Core Totals
        BigDecimal totalRevenue = orderRepository.sumTotalRevenue();
        if (totalRevenue == null) totalRevenue = BigDecimal.ZERO;
        
        long totalOrders = orderRepository.count();
        long totalCustomers = userRepository.count();
        long totalProducts = productRepository.count();

        // 2. Weekly Revenue (Last 7 days)
        LocalDateTime since = LocalDateTime.now().minusDays(7);
        List<Object[]> dailyData = orderRepository.getDailyRevenue(since);
        
        List<DashboardStatsResponse.RevenueByDay> weeklyRevenue = dailyData.stream()
                .map(row -> new DashboardStatsResponse.RevenueByDay(
                        row[0].toString(), 
                        new BigDecimal(row[1].toString())
                ))
                .collect(Collectors.toList());

        // 3. Top Category Sales (Calculate Percentage)
        List<Object[]> categoryData = orderRepository.getTopCategorySales();
        String[] colors = {"#2563eb", "#0ea5e9", "#8b5cf6", "#f59e0b"};
        
        long totalSoldItems = categoryData.stream()
                .mapToLong(row -> Long.parseLong(row[1].toString()))
                .sum();

        List<DashboardStatsResponse.CategorySale> topCategories = new ArrayList<>();
        for (int i = 0; i < categoryData.size(); i++) {
            Object[] row = categoryData.get(i);
            long count = Long.parseLong(row[1].toString());
            long percentage = (totalSoldItems > 0) ? (count * 100 / totalSoldItems) : 0;

            topCategories.add(new DashboardStatsResponse.CategorySale(
                    row[0].toString(),
                    percentage,
                    colors[i % colors.length]
            ));
        }

        return DashboardStatsResponse.builder()
                .totalRevenue(totalRevenue)
                .totalOrders(totalOrders)
                .totalCustomers(totalCustomers)
                .totalProducts(totalProducts)
                .weeklyRevenue(weeklyRevenue)
                .topCategories(topCategories)
                .build();
    }
}
