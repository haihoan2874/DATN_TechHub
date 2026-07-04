package com.haihoan2874.techhub.controller;

import com.haihoan2874.techhub.constant.APIConstants;
import com.haihoan2874.techhub.dto.response.UserResponse;
import com.haihoan2874.techhub.security.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.security.core.Authentication;
import org.springframework.http.MediaType;

import com.haihoan2874.techhub.dto.request.UserUpdateRequest;
import com.haihoan2874.techhub.model.UserRole;

import java.util.List;
import java.util.UUID;

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

    @GetMapping("/me")
    @Operation(summary = "Get my info", description = "Get current authenticated user info")
    @SecurityRequirement(name = APIConstants.BEARER)
    public ResponseEntity<UserResponse> getMyInfo(Authentication authentication) {
        return ResponseEntity.ok(userService.getMyInfo(authentication));
    }

    @PutMapping("/profile")
    @Operation(summary = "Update profile", description = "Update current authenticated user profile")
    @SecurityRequirement(name = APIConstants.BEARER)
    public ResponseEntity<UserResponse> updateProfile(@Valid @RequestBody UserUpdateRequest request, Authentication authentication) {
        return ResponseEntity.ok(userService.updateProfile(request, authentication));
    }

    @PostMapping(value = "/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload avatar", description = "Upload current authenticated user avatar")
    @SecurityRequirement(name = APIConstants.BEARER)
    public ResponseEntity<UserResponse> uploadAvatar(@RequestParam("file") MultipartFile file, Authentication authentication) {
        return ResponseEntity.ok(userService.uploadAvatar(file, authentication));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete user", description = "Permanently delete a user from the system")
    @SecurityRequirement(name = APIConstants.BEARER)
    @PreAuthorize(APIConstants.ROLE_ADMIN)
    public ResponseEntity<Void> deleteUser(@PathVariable UUID id) {
        userService.deleteUser(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/status")
    @Operation(summary = "Toggle user status", description = "Enable or disable a user account")
    @SecurityRequirement(name = APIConstants.BEARER)
    @PreAuthorize(APIConstants.ROLE_ADMIN)
    public ResponseEntity<UserResponse> toggleUserStatus(@PathVariable UUID id,
                                                         Authentication authentication) {
        return ResponseEntity.ok(userService.toggleUserStatus(id, authentication));
    }

    @PutMapping("/{id}/role")
    @Operation(summary = "Update user role", description = "Change a user's role (Admin/Customer)")
    @SecurityRequirement(name = APIConstants.BEARER)
    @PreAuthorize(APIConstants.ROLE_ADMIN)
    public ResponseEntity<UserResponse> updateUserRole(@PathVariable UUID id, @RequestParam UserRole role) {
        return ResponseEntity.ok(userService.updateUserRole(id, role));
    }
}
