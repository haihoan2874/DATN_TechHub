package com.haihoan2874.techhub.repository;

import com.haihoan2874.techhub.model.ProductItem;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProductItemRepository extends JpaRepository<ProductItem, UUID> {

    List<ProductItem> findByStockImportIdOrderByCreatedAtAsc(UUID stockImportId);

    List<ProductItem> findByProductIdOrderByCreatedAtAsc(UUID productId);

    List<ProductItem> findByProductIdAndStatusOrderByCreatedAtAsc(UUID productId, String status);

    long countByStockImportIdAndStatus(UUID stockImportId, String status);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM ProductItem p WHERE p.productId = :productId AND p.status = 'AVAILABLE' ORDER BY p.createdAt ASC")
    List<ProductItem> findAvailableForUpdate(@Param("productId") UUID productId, Pageable pageable);
}
