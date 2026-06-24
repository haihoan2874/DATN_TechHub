package com.haihoan2874.techhub.controller;

import com.haihoan2874.techhub.dto.response.DashboardStatsResponse;
import com.haihoan2874.techhub.service.AdminReportService;
import com.haihoan2874.techhub.service.AdminService;
import com.haihoan2874.techhub.service.FileStorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@Tag(name = "Admin", description = "Admin-only management endpoints")
public class AdminController {

    private final AdminService adminService;
    private final AdminReportService adminReportService;
    private final FileStorageService fileStorageService;

    @GetMapping("/dashboard/stats")
    @Operation(summary = "Get dashboard statistics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DashboardStatsResponse> getDashboardStats(
            @RequestParam(value = "range", defaultValue = "month") String range,
            @RequestParam(value = "startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(value = "endDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        return ResponseEntity.ok(adminService.getDashboardStats(range, startDate, endDate));
    }

    @GetMapping("/reports/orders/export")
    @Operation(summary = "Export order and revenue report as Excel")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<byte[]> exportOrderReport(
            @RequestParam(value = "period", defaultValue = "MONTH") String period,
            @RequestParam(value = "fromDate", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(value = "toDate", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            Authentication authentication
    ) {
        byte[] workbook = adminReportService.exportOrderRevenueWorkbook(period, fromDate, toDate, authentication);
        String filename = adminReportService.buildReportFilename(period, fromDate, toDate);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(workbook);
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
