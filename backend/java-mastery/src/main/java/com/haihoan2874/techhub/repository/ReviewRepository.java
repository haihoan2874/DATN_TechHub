package com.haihoan2874.techhub.repository;

import com.haihoan2874.techhub.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Set;
import java.util.UUID;

@Repository
public interface ReviewRepository extends JpaRepository<Review, UUID> {
    @Query("""
            SELECT COUNT(r) > 0 FROM Review r
            WHERE r.product.id = :productId
            AND r.user.id = :userId
            """)
    Boolean existsByProductIdAndUserId(@Param("productId") UUID productId,
                                       @Param("userId") UUID userId);

    /**
     * Lấy tất cả productId mà user đã review trong 1 query duy nhất.
     * Dùng thay thế cho existsByProductIdAndUserId() khi cần kiểm tra nhiều sản phẩm
     * cùng lúc (VD: lấy lịch sử đơn hàng) để tránh N+1 Query Problem.
     */
    @Query("SELECT r.product.id FROM Review r WHERE r.user.id = :userId")
    Set<UUID> findReviewedProductIdsByUserId(@Param("userId") UUID userId);

    @Query("""
            SELECT r FROM Review r
            JOIN FETCH r.product
            JOIN FETCH r.user
            LEFT JOIN FETCH r.adminRepliedBy
            ORDER BY r.createdAt DESC
            """)
    java.util.List<Review> findAllWithProductAndUser();

    @Query("""
            SELECT r FROM Review r
            JOIN FETCH r.product
            JOIN FETCH r.user
            LEFT JOIN FETCH r.adminRepliedBy
            WHERE r.product.id = :productId
            ORDER BY r.createdAt DESC
            """)
    java.util.List<Review> findByProductId(@Param("productId") UUID productId);
}
