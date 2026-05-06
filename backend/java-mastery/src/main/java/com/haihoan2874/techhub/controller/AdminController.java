package com.haihoan2874.techhub.controller;

import com.haihoan2874.techhub.dto.response.DashboardStatsResponse;
import com.haihoan2874.techhub.service.AdminService;
import com.haihoan2874.techhub.service.FileStorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@Tag(name = "Admin", description = "Admin-only management endpoints")
public class AdminController {

    private final AdminService adminService;
    private final FileStorageService fileStorageService;

    @GetMapping("/dashboard/stats")
    @Operation(summary = "Get dashboard statistics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DashboardStatsResponse> getDashboardStats() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    @PostMapping("/files/upload")
    @Operation(summary = "Centralized file upload for Admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "folder", defaultValue = "products") String folder
    ) {
        String fileUrl = fileStorageService.storeFile(file, folder);
        return ResponseEntity.ok(Map.of("url", fileUrl));
    }
}
