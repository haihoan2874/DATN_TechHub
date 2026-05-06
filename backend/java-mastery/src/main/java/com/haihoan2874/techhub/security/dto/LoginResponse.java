package com.haihoan2874.techhub.security.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for login response.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginResponse {

    private String token;
    private String type;
    private String role;
    private String username;
    private String firstName;
    private String lastName;
    private String imageUrl;

    public LoginResponse(String token, String role, String username, String firstName, String lastName, String imageUrl) {
        this.token = token;
        this.type = "Bearer";
        this.role = role;
        this.username = username;
        this.firstName = firstName;
        this.lastName = lastName;
        this.imageUrl = imageUrl;
    }

    public LoginResponse(String token) {
        this.token = token;
        this.type = "Bearer";
    }
}

