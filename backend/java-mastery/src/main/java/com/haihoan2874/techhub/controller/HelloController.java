package com.haihoan2874.techhub.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
 * REST Controller for testing authentication.
 */
@Slf4j
@RestController
@RequestMapping("/hello")
@RequiredArgsConstructor
@Tag(name = "Test", description = "Test endpoints")
public class HelloController {

    /**
     * Protected endpoint to test authentication.
     *
     * @param authentication the authentication object
     * @return greeting message with username
     */
    @GetMapping
    @Operation(summary = "Test authentication", description = "Protected endpoint that requires authentication")
    @SecurityRequirement(name = "bearer")
    public ResponseEntity<Map<String, String>> hello(Authentication authentication) {
        log.info("Hello endpoint accessed by user: {}", authentication.getName());

        Map<String, String> response = new HashMap<>();
        response.put("message", "Hello, " + authentication.getName() + "!");
        response.put("status", "authenticated");

        return ResponseEntity.ok(response);
    }
}
