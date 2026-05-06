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

    @Query(value = """
            SELECT DATE(created_at) as date, SUM(total) as revenue
            FROM orders
            WHERE created_at >= :since
            GROUP BY DATE(created_at)
            ORDER BY DATE(created_at) ASC
            """, nativeQuery = true)
    List<Object[]> getDailyRevenue(@Param("since") LocalDateTime since);

    @Query(value = """
            SELECT c.name, COUNT(oi.id) as count
            FROM categories c
            JOIN products p ON c.id = p.category_id
            JOIN order_items oi ON p.id = oi.product_id
            GROUP BY c.name
            ORDER BY count DESC
            LIMIT 4
            """, nativeQuery = true)
    List<Object[]> getTopCategorySales();
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

    @Query("SELECT DISTINCT o FROM Order o LEFT JOIN FETCH o.items ORDER BY o.createdAt DESC")
    List<Order> findAllWithItems();
}
