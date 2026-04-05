package com.haihoan2874.techhub.repository;

import com.haihoan2874.techhub.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {
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
            WHERE o.orderNumber = :orderNumber AND o.userId = :userId
            """)
    Optional<Order> findByOrderNumberAndUserId(@Param("orderNumber") String orderNumber, @Param("userId") UUID userId);
}
