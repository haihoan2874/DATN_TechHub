package com.haihoan2874.techhub.security.service;

import com.haihoan2874.techhub.model.User;
import com.haihoan2874.techhub.model.UserRole;
import com.haihoan2874.techhub.repository.UserRepository;
import com.haihoan2874.techhub.security.dto.LoginRequest;
import com.haihoan2874.techhub.security.dto.LoginResponse;
import com.haihoan2874.techhub.security.dto.RegistrationRequest;
import com.haihoan2874.techhub.security.dto.RegistrationResponse;
import com.haihoan2874.techhub.dto.response.UserResponse;
import com.haihoan2874.techhub.security.jwt.JwtTokenProvider;
import com.haihoan2874.techhub.security.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;

/**
 * Service for user authentication and registration.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserMapper userMapper;

    public java.util.List<UserResponse> getAllUsers() {
        log.info("Admin is fetching all users");
        return userRepository.findAll().stream()
                .map(user -> UserResponse.builder()
                        .id(user.getId())
                        .username(user.getUsername())
                        .email(user.getEmail())
                        .firstName(user.getFirstName())
                        .lastName(user.getLastName())
                        .role(user.getRole())
                        .isActive(user.getIsActive())
                        .createdAt(user.getCreatedAt())
                        .build())
                .collect(java.util.stream.Collectors.toList());
    }

    /**
     * Register a new user.
     *
     * @param registrationRequest the registration request
     * @return the registration response
     * @throws IllegalArgumentException if username or email already exists
     */
    public RegistrationResponse registration(RegistrationRequest registrationRequest) {
        log.info("Registering new user with username: {}", registrationRequest.getUsername());

        // Check if username already exists
        if (userRepository.existsByUsername(registrationRequest.getUsername())) {
            log.error("Username already exists: {}", registrationRequest.getUsername());
            throw new IllegalArgumentException("Username already exists");
        }

        // Check if email already exists
        if (userRepository.existsByEmail(registrationRequest.getEmail())) {
            log.error("Email already exists: {}", registrationRequest.getEmail());
            throw new IllegalArgumentException("Email already exists");
        }

        // Create new user
        User user = userMapper.registrationRequestToUser(registrationRequest);
        user.setPassword(passwordEncoder.encode(registrationRequest.getPassword()));
        user.setRole(UserRole.ROLE_USER);
        user.setIsActive(true);

        // Save user
        User savedUser = userRepository.save(user);
        log.info("User registered successfully with ID: {}", savedUser.getId());

        return userMapper.userToRegistrationResponse(savedUser);
    }

    /**
     * Authenticate user and generate JWT token.
     *
     * @param loginRequest the login request
     * @return the login response with JWT token
     * @throws IllegalArgumentException if username not found or password is incorrect
     */
    public LoginResponse login(LoginRequest loginRequest) {
        log.info("Authenticating user: {}", loginRequest.getUsername());

        // Find user by username
        User user = userRepository.findByUsername(loginRequest.getUsername())
                .orElseThrow(() -> {
                    log.error("User not found: {}", loginRequest.getUsername());
                    return new IllegalArgumentException("Invalid username or password");
                });

        // Verify password
        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            log.error("Invalid password for user: {}", loginRequest.getUsername());
            throw new IllegalArgumentException("Invalid username or password");
        }

        String role = user.getRole().getValue();
        // Generate JWT token
        String token = jwtTokenProvider.generateToken(user.getUsername(), role);
        log.info("JWT token generated for user: {}", user.getUsername());

        return new LoginResponse(token);
    }

    /**
     * Get user by username.
     *
     * @param username the username
     * @return the user
     * @throws IllegalArgumentException if user not found
     */
    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + username));
    }

    public UUID getCurrentUserId(Authentication authentication) {
        if (authentication != null && authentication.isAuthenticated()) {
            return userRepository.findByUsername(authentication.getName())
                    .map(User::getId)
                    .orElse(null);
        }
        return null;
    }
}

