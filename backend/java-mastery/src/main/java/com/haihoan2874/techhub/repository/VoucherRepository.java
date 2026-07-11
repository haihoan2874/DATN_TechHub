package com.haihoan2874.techhub.repository;

import com.haihoan2874.techhub.model.Voucher;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface VoucherRepository extends JpaRepository<Voucher, UUID> {
    Optional<Voucher> findByCodeIgnoreCase(String code);

    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("SELECT v FROM Voucher v WHERE LOWER(v.code) = LOWER(:code)")
    Optional<Voucher> findByCodeIgnoreCaseForUpdate(@org.springframework.data.repository.query.Param("code") String code);
    boolean existsByCodeIgnoreCase(String code);
}
