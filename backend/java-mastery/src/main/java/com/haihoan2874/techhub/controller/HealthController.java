package com.haihoan2874.techhub.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
 * REST Controller for health check endpoints (no authentication required).
 */
@Slf4j
@RestController
@RequestMapping("/health")
@Tag(name = "Health", description = "Health check endpoints")
public class HealthController {

    /**
     * Public health check endpoint (no authentication required).
     *
     * @return health status
     */
    @GetMapping
    @Operation(summary = "Health check", description = "Public endpoint to check application health status")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        log.info("Health check endpoint accessed");

        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("timestamp", System.currentTimeMillis());
        response.put("service", "springboot-boilerplate");

        return ResponseEntity.ok(response);
    }
}
