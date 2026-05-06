package com.haihoan2874.techhub.dto.response;

import com.haihoan2874.techhub.model.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {
    private UUID id;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private String fullName;
    private String phoneNumber;
    private String imageUrl;
    private UserRole role;
    private Boolean isActive;
    private LocalDateTime createdAt;
}
