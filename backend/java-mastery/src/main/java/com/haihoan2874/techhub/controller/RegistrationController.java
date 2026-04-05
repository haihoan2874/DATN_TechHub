package com.haihoan2874.techhub.controller;

import com.haihoan2874.techhub.security.dto.RegistrationRequest;
import com.haihoan2874.techhub.security.dto.RegistrationResponse;
import com.haihoan2874.techhub.security.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

/**
 * REST Controller for user registration.
 */
@Slf4j
@RestController
@RequestMapping("/register")
@RequiredArgsConstructor
@Validated
@Tag(name = "Authentication", description = "User authentication endpoints")
public class RegistrationController {

    private final UserService userService;

    /**
     * Register a new user.
     *
     * @param registrationRequest the registration data
     * @return ResponseEntity with registration details
     */
    @PostMapping
    @Operation(summary = "User registration", description = "Register a new user account")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Registration successful",
            content = @Content(schema = @Schema(implementation = RegistrationResponse.class))),
        @ApiResponse(responseCode = "400", description = "Invalid input or user already exists")
    })
    public ResponseEntity<RegistrationResponse> register(@Valid @RequestBody RegistrationRequest registrationRequest) {
        log.info("Registration attempt for user: {}", registrationRequest.getUsername());

        RegistrationResponse response = userService.registration(registrationRequest);

        log.info("User registered successfully: {}", registrationRequest.getUsername());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
}

