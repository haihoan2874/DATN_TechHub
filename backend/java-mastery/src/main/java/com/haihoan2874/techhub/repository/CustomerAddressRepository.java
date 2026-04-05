package com.haihoan2874.techhub.repository;

import com.haihoan2874.techhub.model.CustomerAddress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;
import java.util.UUID;

@Repository
public interface CustomerAddressRepository extends JpaRepository<CustomerAddress, UUID> {
    long countByUserId(UUID userId);

    @Modifying
    @Query("""
            UPDATE CustomerAddress 
            a SET a.isDefault=false 
            WHERE a.userId = :userId
            """)
    void resetDefaultAddressForUser(@Param("userId") UUID userId);

    List<CustomerAddress> findByUserIdOrderByIsDefaultDescCreatedAtDesc(UUID userId);

    Optional<CustomerAddress> findByIdAndUserId(UUID id, UUID userId);
}





