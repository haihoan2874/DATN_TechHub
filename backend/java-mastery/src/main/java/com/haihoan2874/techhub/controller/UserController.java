package com.haihoan2874.techhub.controller;

import com.haihoan2874.techhub.constant.APIConstants;
import com.haihoan2874.techhub.dto.response.UserResponse;
import com.haihoan2874.techhub.security.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/users")
@Tag(name = "Users", description = "User management endpoints (Admin only)")
public class UserController {

    private final UserService userService;

    @GetMapping
    @Operation(summary = "Get all users", description = "List all registered users in the system")
    @SecurityRequirement(name = APIConstants.BEARER)
    @PreAuthorize(APIConstants.ROLE_ADMIN)
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        log.info("Admin request: Listing all users");
        return ResponseEntity.ok(userService.getAllUsers());
    }
}
