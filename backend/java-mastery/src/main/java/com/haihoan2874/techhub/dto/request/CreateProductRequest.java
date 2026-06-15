package com.haihoan2874.techhub.dto.request;

import com.haihoan2874.techhub.dto.request.base.BaseProductRequest;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
public class CreateProductRequest extends BaseProductRequest {
    private BigDecimal initialImportPrice;
    private LocalDateTime initialImportedAt;
    private String initialImportNote;
}
