package com.haihoan2874.techhub.dto.request;

import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserUpdateRequest {
    private String firstName;
    private String lastName;
    private String email;
    @Pattern(regexp = "^$|^0\\d{9,10}$", message = "Phone number must contain 10-11 digits and start with 0")
    private String phoneNumber;
    private String fullName;
    private String imageUrl;
}
