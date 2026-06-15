package com.haihoan2874.techhub.repository;

import com.haihoan2874.techhub.model.StockImport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface StockImportRepository extends JpaRepository<StockImport, UUID> {
    List<StockImport> findAllByOrderByImportedAtDesc();

    // Lấy lịch sử nhập kho của 1 sản phẩm, mới nhất trước
    List<StockImport> findByProductIdOrderByImportedAtDesc(UUID productId);
}
