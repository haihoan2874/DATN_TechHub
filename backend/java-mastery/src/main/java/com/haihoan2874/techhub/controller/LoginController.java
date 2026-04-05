package com.haihoan2874.techhub.controller;

import com.haihoan2874.techhub.security.dto.LoginRequest;
import com.haihoan2874.techhub.security.dto.LoginResponse;
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
 * REST Controller for user login.
 */
@Slf4j
@RestController
@RequestMapping("/login")
@RequiredArgsConstructor
@Validated
@Tag(name = "Authentication", description = "User authentication endpoints")
public class LoginController {

    private final UserService userService;

    /**
     * Login with username and password.
     *
     * @param loginRequest the login credentials
     * @return ResponseEntity with JWT token
     */
    @PostMapping
    @Operation(summary = "User login", description = "Authenticate user with username and password")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Login successful",
            content = @Content(schema = @Schema(implementation = LoginResponse.class))),
        @ApiResponse(responseCode = "400", description = "Invalid credentials")
    })
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        log.info("Login attempt for user: {}", loginRequest.getUsername());

        LoginResponse response = userService.login(loginRequest);

        log.info("User logged in successfully: {}", loginRequest.getUsername());
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}
