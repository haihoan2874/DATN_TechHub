package com.haihoan2874.techhub.service;

import com.haihoan2874.techhub.dto.response.DashboardStatsResponse;
import com.haihoan2874.techhub.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.sql.Date;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    public DashboardStatsResponse getDashboardStats() {
        return getDashboardStats("month");
    }

    public DashboardStatsResponse getDashboardStats(String range) {
        DashboardRange dashboardRange = resolveRange(range);

        BigDecimal totalRevenue = orderRepository.sumDeliveredRevenueBetween(
                dashboardRange.startDate(),
                dashboardRange.endDate()
        );
        if (totalRevenue == null) {
            totalRevenue = BigDecimal.ZERO;
        }

        long totalOrders = orderRepository.countOrdersBetween(
                dashboardRange.startDate(),
                dashboardRange.endDate()
        );
        long totalCustomers = userRepository.count();
        long totalProducts = productRepository.count();

        List<DashboardStatsResponse.RevenueByDay> weeklyRevenue = buildRevenueSeries(dashboardRange);

        List<Object[]> categoryData = orderRepository.getTopCategorySales(
                dashboardRange.startDate(),
                dashboardRange.endDate()
        );
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

        List<DashboardStatsResponse.OrderStatusSummary> orderStatuses = orderRepository
                .getOrderStatusSummary(dashboardRange.startDate(), dashboardRange.endDate())
                .stream()
                .map(row -> new DashboardStatsResponse.OrderStatusSummary(
                        row[0].toString(),
                        Long.parseLong(row[1].toString())
                ))
                .collect(Collectors.toList());

        List<DashboardStatsResponse.ProductSale> topProducts = orderRepository
                .getTopSellingProducts(dashboardRange.startDate(), dashboardRange.endDate())
                .stream()
                .map(row -> new DashboardStatsResponse.ProductSale(
                        row[0].toString(),
                        row[1] != null ? row[1].toString() : null,
                        Long.parseLong(row[2].toString()),
                        new BigDecimal(row[3].toString())
                ))
                .collect(Collectors.toList());

        List<DashboardStatsResponse.LowStockProduct> lowStockProducts = productRepository
                .findLowStockProducts(5)
                .stream()
                .map(row -> new DashboardStatsResponse.LowStockProduct(
                        row[0].toString(),
                        row[1] != null ? row[1].toString() : null,
                        Integer.parseInt(row[2].toString())
                ))
                .collect(Collectors.toList());

        return DashboardStatsResponse.builder()
                .range(dashboardRange.key())
                .rangeLabel(dashboardRange.label())
                .totalRevenue(totalRevenue)
                .totalOrders(totalOrders)
                .totalCustomers(totalCustomers)
                .totalProducts(totalProducts)
                .weeklyRevenue(weeklyRevenue)
                .topCategories(topCategories)
                .orderStatuses(orderStatuses)
                .topProducts(topProducts)
                .lowStockProducts(lowStockProducts)
                .build();
    }

    private List<DashboardStatsResponse.RevenueByDay> buildRevenueSeries(DashboardRange dashboardRange) {
        List<Object[]> dailyData = orderRepository.getDailyRevenue(
                dashboardRange.startDate(),
                dashboardRange.endDate()
        );
        Map<LocalDate, BigDecimal> revenueByDate = new HashMap<>();
        for (Object[] row : dailyData) {
            LocalDate date = toLocalDate(row[0]);
            revenueByDate.put(date, new BigDecimal(row[1].toString()));
        }

        List<DashboardStatsResponse.RevenueByDay> series = new ArrayList<>();
        LocalDate cursor = dashboardRange.startDate().toLocalDate();
        LocalDate end = dashboardRange.endDate().toLocalDate();
        while (!cursor.isAfter(end)) {
            series.add(new DashboardStatsResponse.RevenueByDay(
                    cursor.toString(),
                    revenueByDate.getOrDefault(cursor, BigDecimal.ZERO)
            ));
            cursor = cursor.plusDays(1);
        }

        return series;
    }

    private LocalDate toLocalDate(Object value) {
        if (value instanceof Date date) {
            return date.toLocalDate();
        }
        return LocalDate.parse(value.toString());
    }

    private DashboardRange resolveRange(String range) {
        LocalDate today = LocalDate.now();
        String normalizedRange = range == null ? "month" : range;
        LocalDate startDate;
        String label;

        switch (normalizedRange) {
            case "today" -> {
                startDate = today;
                label = "Hôm nay";
            }
            case "week" -> {
                startDate = today.with(java.time.DayOfWeek.MONDAY);
                label = "Tuần này";
            }
            case "month" -> {
                startDate = today.withDayOfMonth(1);
                label = "Tháng này";
            }
            case "quarter" -> {
                int firstMonthOfQuarter = ((today.getMonthValue() - 1) / 3) * 3 + 1;
                startDate = LocalDate.of(today.getYear(), firstMonthOfQuarter, 1);
                label = "Quý này";
            }
            case "year" -> {
                startDate = LocalDate.of(today.getYear(), 1, 1);
                label = "Năm nay";
            }
            default -> {
                normalizedRange = "month";
                startDate = today.withDayOfMonth(1);
                label = "Tháng này";
            }
        }

        return new DashboardRange(
                normalizedRange,
                label,
                startDate.atStartOfDay(),
                today.atTime(LocalTime.MAX)
        );
    }

    private record DashboardRange(
            String key,
            String label,
            LocalDateTime startDate,
            LocalDateTime endDate
    ) {}
}
