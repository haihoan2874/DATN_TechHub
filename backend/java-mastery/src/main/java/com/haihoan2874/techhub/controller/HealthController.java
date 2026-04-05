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
 * REST Controller for health checks.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/health")
@Tag(name = "Health", description = "Health check endpoints")
public class HealthController {

    /**
     * Check if the application is running.
     *
     * @return health status map
     */
    @GetMapping
    @Operation(summary = "Health check", description = "Endpoint to check application health status")
    public ResponseEntity<Map<String, Object>> health() {
        log.info("Health check endpoint accessed");
        Map<String, Object> status = new HashMap<>();
        status.put("status", "UP");
        status.put("message", "Service is healthy");
        status.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(status);
    }
}
