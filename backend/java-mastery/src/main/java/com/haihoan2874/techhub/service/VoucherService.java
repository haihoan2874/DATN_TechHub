package com.haihoan2874.techhub.service;

import com.haihoan2874.techhub.dto.response.VoucherApplyResponse;
import com.haihoan2874.techhub.model.DiscountType;
import com.haihoan2874.techhub.model.Voucher;
import com.haihoan2874.techhub.repository.VoucherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class VoucherService {
    private final VoucherRepository voucherRepository;

    public VoucherApplyResponse applyVoucher(String code, BigDecimal orderAmount) {
        Voucher voucher = findValidVoucher(code, orderAmount);
        BigDecimal discountAmount = calculateDiscount(voucher, orderAmount);
        BigDecimal finalAmount = orderAmount.subtract(discountAmount).max(BigDecimal.ZERO);

        return VoucherApplyResponse.builder()
                .id(voucher.getId())
                .code(voucher.getCode())
                .discountType(voucher.getDiscountType().name())
                .discountValue(voucher.getDiscountValue())
                .discountAmount(discountAmount)
                .finalAmount(finalAmount)
                .message("Áp dụng mã giảm giá thành công")
                .build();
    }

    @Transactional
    public void consumeVoucher(String code, BigDecimal orderAmount) {
        if (code == null || code.isBlank()) {
            return;
        }
        Voucher voucher = findValidVoucher(code, orderAmount);
        voucher.setUsedCount(voucher.getUsedCount() + 1);
        voucherRepository.save(voucher);
    }

    private Voucher findValidVoucher(String code, BigDecimal orderAmount) {
        if (code == null || code.isBlank()) {
            throw new IllegalStateException("Mã giảm giá không hợp lệ hoặc đã hết hạn sử dụng");
        }

        Voucher voucher = voucherRepository.findByCodeIgnoreCase(code.trim())
                .orElseThrow(() -> new IllegalStateException("Mã giảm giá không hợp lệ hoặc đã hết hạn sử dụng"));

        if (Boolean.FALSE.equals(voucher.getIsActive()) || voucher.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalStateException("Mã giảm giá không hợp lệ hoặc đã hết hạn sử dụng");
        }
        if (voucher.getUsageLimit() != null && voucher.getUsedCount() >= voucher.getUsageLimit()) {
            throw new IllegalStateException("Mã giảm giá đã được sử dụng hết");
        }
        if (orderAmount.compareTo(voucher.getMinOrderAmount()) < 0) {
            throw new IllegalStateException("Đơn hàng chưa đạt giá trị tối thiểu để sử dụng mã này");
        }

        return voucher;
    }

    private BigDecimal calculateDiscount(Voucher voucher, BigDecimal orderAmount) {
        BigDecimal discount;
        if (voucher.getDiscountType() == DiscountType.PERCENT) {
            discount = orderAmount
                    .multiply(voucher.getDiscountValue())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        } else {
            discount = voucher.getDiscountValue();
        }
        return discount.min(orderAmount).max(BigDecimal.ZERO);
    }
}
