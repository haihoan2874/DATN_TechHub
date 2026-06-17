package com.haihoan2874.techhub.repository;

import com.haihoan2874.techhub.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {
    
    @Query("SELECT SUM(o.total) FROM Order o")
    java.math.BigDecimal sumTotalRevenue();

    @Query("""
            SELECT COALESCE(SUM(o.total), 0)
            FROM Order o
            WHERE o.status = com.haihoan2874.techhub.model.OrderStatus.DELIVERED
            AND o.createdAt BETWEEN :startDate AND :endDate
            """)
    java.math.BigDecimal sumDeliveredRevenueBetween(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    @Query("""
            SELECT COALESCE(SUM(COALESCE(i.costPrice, 0) * i.quantity), 0)
            FROM Order o
            JOIN o.items i
            WHERE o.status = com.haihoan2874.techhub.model.OrderStatus.DELIVERED
            AND o.createdAt BETWEEN :startDate AND :endDate
            """)
    java.math.BigDecimal sumDeliveredCostBetween(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );


    @Query("""
            SELECT COUNT(o)
            FROM Order o
            WHERE o.createdAt BETWEEN :startDate AND :endDate
            """)
    long countOrdersBetween(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    @Query(value = """
            SELECT DATE(created_at) as date, SUM(total) as revenue
            FROM orders
            WHERE status = 'DELIVERED'
            AND created_at BETWEEN :startDate AND :endDate
            GROUP BY DATE(created_at)
            ORDER BY DATE(created_at) ASC
            """, nativeQuery = true)
    List<Object[]> getDailyRevenue(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    @Query(value = """
            SELECT c.name, COUNT(oi.id) as count
            FROM categories c
            JOIN products p ON c.id = p.category_id
            JOIN order_items oi ON p.id = oi.product_id
            JOIN orders o ON o.id = oi.order_id
            WHERE o.status <> 'CANCELLED'
            AND o.created_at BETWEEN :startDate AND :endDate
            GROUP BY c.name
            ORDER BY count DESC
            LIMIT 4
            """, nativeQuery = true)
    List<Object[]> getTopCategorySales(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    @Query(value = """
            SELECT status, COUNT(*) as count
            FROM orders
            WHERE created_at BETWEEN :startDate AND :endDate
            GROUP BY status
            ORDER BY count DESC
            """, nativeQuery = true)
    List<Object[]> getOrderStatusSummary(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    @Query(value = """
            SELECT CAST(p.id AS varchar) as id, p.name, p.image_url, SUM(oi.quantity) as quantity, SUM(oi.subtotal) as revenue, SUM(oi.subtotal - (COALESCE(oi.cost_price, p.cost_price, 0) * oi.quantity)) as profit
            FROM order_items oi
            JOIN orders o ON o.id = oi.order_id
            JOIN products p ON p.id = oi.product_id
            WHERE o.status = 'DELIVERED'
            AND o.created_at BETWEEN :startDate AND :endDate
            GROUP BY p.id, p.name, p.image_url
            ORDER BY profit DESC, revenue DESC
            LIMIT 5
            """, nativeQuery = true)
    List<Object[]> getTopSellingProducts(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );
    @Query(value = """
            SELECT COUNT(*)
            FROM orders
            WHERE created_at BETWEEN :startOfDay AND :endOfDay
            """, nativeQuery = true)
    Long countByCreatedAtBetween(@Param("startOfDay") LocalDateTime startOfDay, @Param("endOfDay") LocalDateTime endOfDay);

    @Query("""
            SELECT o FROM Order o
            LEFT JOIN FETCH o.items
            WHERE o.id = :id AND o.userId = :userId
            """)
    Optional<Order> findByIdAndUserId(@Param("id") UUID id, @Param("userId") UUID userId);

    @Query("""
            SELECT o
            FROM Order o
            LEFT JOIN FETCH o.items
            WHERE o.orderNumber = :orderNumber
            """)
    Optional<Order> findByOrderNumber(@Param("orderNumber") String orderNumber);

    @Query("""
            SELECT o
            FROM Order o
            LEFT JOIN FETCH o.items
            WHERE o.orderNumber = :orderNumber AND o.userId = :userId
            """)
    Optional<Order> findByOrderNumberAndUserId(@Param("orderNumber") String orderNumber, @Param("userId") UUID userId);

    @Query("SELECT DISTINCT o FROM Order o LEFT JOIN FETCH o.items WHERE o.userId = :userId ORDER BY o.createdAt DESC")
    List<Order> findByUserIdOrderByCreatedAtDesc(@Param("userId") UUID userId);

    @Query("""
            SELECT COUNT(o) > 0
            FROM Order o
            JOIN o.items i
            WHERE o.userId = :userId
            AND o.status = com.haihoan2874.techhub.model.OrderStatus.DELIVERED
            AND i.productId = :productId
            """)
    boolean existsDeliveredOrderContainingProduct(@Param("userId") UUID userId, @Param("productId") UUID productId);

    @Query("SELECT DISTINCT o FROM Order o LEFT JOIN FETCH o.items LEFT JOIN FETCH o.shippingAddress ORDER BY o.createdAt DESC")
    List<Order> findAllWithItems();

    @Query("""
            SELECT DISTINCT o
            FROM Order o
            LEFT JOIN FETCH o.items
            LEFT JOIN FETCH o.shippingAddress
            WHERE o.createdAt BETWEEN :startDate AND :endDate
            ORDER BY o.createdAt DESC
            """)
    List<Order> findReportOrdersBetween(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );
}
