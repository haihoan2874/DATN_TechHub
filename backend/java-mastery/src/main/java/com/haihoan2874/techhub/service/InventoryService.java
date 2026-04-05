package com.haihoan2874.techhub.service;

import com.haihoan2874.techhub.model.Inventory;
import com.haihoan2874.techhub.repository.InventoryRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class InventoryService {
    private final InventoryRepository inventoryRepository;

    @Transactional
    public void initializeInventory(UUID productId, Integer initialStock) {
        log.info("Initializing inventory for product {}: stock {}", productId, initialStock);
        Inventory inventory = Inventory.builder()
                .productId(productId)
                .quantityAvailable(initialStock)
                .quantityReserved(0)
                .minStockLevel(10)
                .build();
        inventoryRepository.save(inventory);
    }

    @Transactional
    public void updateStock(UUID productId, Integer newStock) {
        log.info("Updating stock for product {}: new stock {}", productId, newStock);
        Inventory inventory = inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new EntityNotFoundException("Inventory info not found for product: " + productId));

        inventory.setQuantityAvailable(newStock);
        inventory.setLastRestockDate(LocalDateTime.now());
        inventoryRepository.save(inventory);
    }

    @Transactional
    public boolean reserveStock(UUID productId, Integer quantity) {
        log.info("Reserving stock for product {}: quantity {}", productId, quantity);
        Inventory inventory = inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new EntityNotFoundException("Inventory not found"));

        if (inventory.getQuantityAvailable() < quantity) {
            log.warn("Not enough stock for product {}: requested {}, available {}",
                    productId, quantity, inventory.getQuantityAvailable());
            return false;
        }

        inventory.setQuantityAvailable(inventory.getQuantityAvailable() - quantity);
        inventory.setQuantityReserved(inventory.getQuantityReserved() + quantity);
        inventoryRepository.save(inventory);
        return true;
    }

    @Transactional
    public void releaseStock(UUID productId, Integer quantity) {
        log.info("Releasing reserved stock for product {}: quantity {}", productId, quantity);
        Inventory inventory = inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new EntityNotFoundException("Inventory not found"));

        inventory.setQuantityReserved(Math.max(0, inventory.getQuantityReserved() - quantity));
        inventory.setQuantityAvailable(inventory.getQuantityAvailable() + quantity);
        inventoryRepository.save(inventory);
    }

    @Transactional
    public void confirmSale(UUID productId, Integer quantity) {
        log.info("Confirming sale for product {}: quantity {}", productId, quantity);
        Inventory inventory = inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new EntityNotFoundException("Inventory not found"));

        inventory.setQuantityReserved(Math.max(0, inventory.getQuantityReserved() - quantity));
        inventoryRepository.save(inventory);
    }

    public Integer getAvailableStock(UUID productId) {
        return inventoryRepository.findByProductId(productId)
                .map(Inventory::getQuantityAvailable)
                .orElse(0);
    }
}
