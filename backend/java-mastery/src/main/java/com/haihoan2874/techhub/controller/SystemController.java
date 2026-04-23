package com.haihoan2874.techhub.controller;

import com.haihoan2874.techhub.service.DataSeederService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/system")
@RequiredArgsConstructor
@Tag(name = "System", description = "System management and maintenance APIs")
public class SystemController {

    private final DataSeederService dataSeederService;

    @PostMapping("/seed")
    @Operation(summary = "Seed S-Life Data", description = "Import products and reviews from crawler JSON files with accurate mapping")
    public ResponseEntity<String> seedData() {
        dataSeederService.seedAll();
        return ResponseEntity.ok("Quá trình Seed dữ liệu S-Life đã hoàn tất thành công! Sẵn sàng phục vụ khách hàng.");
    }
}
