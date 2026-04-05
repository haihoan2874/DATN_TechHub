package com.haihoan2874.techhub.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GetListCustomerAddressResponse {
    private UUID id;
    private String fullName;
    private String phone;
    private String address;
    private String city;
    private String postalCode;
    private Boolean isDefault;
    private LocalDateTime createdAt;
}
