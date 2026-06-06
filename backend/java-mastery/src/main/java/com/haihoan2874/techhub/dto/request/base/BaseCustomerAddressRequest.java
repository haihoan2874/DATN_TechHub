package com.haihoan2874.techhub.dto.request.base;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BaseCustomerAddressRequest {
    @NotBlank(message = "Full name is required")
    @Size(max = 255, message = "Full name must be at most 255 characters")
    private String fullName;

    @NotBlank(message = "Phone is required")
    @Pattern(regexp = "^0\\d{9,10}$", message = "Phone number must contain 10-11 digits and start with 0")
    @Size(max = 20, message = "Phone must be at most 20 characters")
    private String phone;

    @NotBlank(message = "Address is required")
    private String address;

    @NotBlank(message = "City is required")
    @Size(max = 100, message = "City must be at most 100 characters")
    private String city;

    @NotBlank(message = "Postal code is required")
    @Pattern(regexp = "^\\d+$", message = "Postal code must contain digits only")
    @Size(max = 20, message = "Postal code must be at most 20 characters")
    private String postalCode;

    private Boolean isDefault;
}
