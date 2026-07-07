package com.haihoan2874.techhub.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "product_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @Column(name = "product_id", nullable = false)
    private UUID productId;

    @Column(name = "stock_import_id", nullable = false)
    private UUID stockImportId;

    @Column(name = "serial_number", nullable = false, unique = true)
    private String serialNumber;

    @Column(nullable = false)
    private String status; // 'AVAILABLE', 'RESERVED', 'SOLD'

    @Column(name = "order_id")
    private UUID orderId;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
