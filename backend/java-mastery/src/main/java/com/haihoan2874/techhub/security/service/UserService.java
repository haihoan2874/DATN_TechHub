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
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import com.haihoan2874.techhub.service.FileStorageService;

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
    private final FileStorageService fileStorageService;

    public java.util.List<UserResponse> getAllUsers() {
        log.info("Admin is fetching all users");
        return userRepository.findAll().stream()
                .map(this::mapToUserResponse)
                .collect(java.util.stream.Collectors.toList());
    }

    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .fullName((((user.getFirstName() != null && !user.getFirstName().equals("null")) ? user.getFirstName() : "") 
                        + ((user.getLastName() != null && !user.getLastName().equals("null")) ? " " + user.getLastName() : "")).trim())
                .phoneNumber(user.getPhoneNumber())
                .imageUrl(user.getImageUrl())
                .role(user.getRole())
                .isActive(user.getIsActive())
                .createdAt(user.getCreatedAt())
                .build();
    }

    public UserResponse getMyInfo(org.springframework.security.core.Authentication authentication) {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return mapToUserResponse(user);
    }

    @Transactional
    public UserResponse updateProfile(com.haihoan2874.techhub.dto.request.UserUpdateRequest request, org.springframework.security.core.Authentication authentication) {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (request.getFirstName() != null) user.setFirstName(request.getFirstName());
        if (request.getLastName() != null) user.setLastName(request.getLastName());
        if (request.getPhoneNumber() != null) user.setPhoneNumber(request.getPhoneNumber());
        if (request.getImageUrl() != null) user.setImageUrl(request.getImageUrl());
        
        // Handle fullName sync
        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            String fullName = request.getFullName().trim();
            int lastSpaceIndex = fullName.lastIndexOf(" ");
            if (lastSpaceIndex != -1) {
                user.setFirstName(fullName.substring(lastSpaceIndex + 1));
                user.setLastName(fullName.substring(0, lastSpaceIndex));
            } else {
                user.setFirstName(fullName);
                user.setLastName("");
            }
        }

        if (request.getEmail() != null) {
            userRepository.findByEmail(request.getEmail()).ifPresent(existingUser -> {
                if (!existingUser.getId().equals(user.getId())) {
                    throw new IllegalArgumentException("Email already exists");
                }
            });
            user.setEmail(request.getEmail());
        }
        if (request.getPhoneNumber() != null) user.setPhoneNumber(request.getPhoneNumber());
        if (request.getImageUrl() != null) user.setImageUrl(request.getImageUrl());

        User savedUser = userRepository.save(user);
        return mapToUserResponse(savedUser);
    }

    @Transactional
    public UserResponse uploadAvatar(MultipartFile file, Authentication authentication) {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String imageUrl = fileStorageService.storeFile(file, "avatars");
        user.setImageUrl(imageUrl);
        
        return mapToUserResponse(userRepository.save(user));
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
        user.setPhoneNumber(registrationRequest.getPhoneNumber()); // Save phone number
        
        // Handle fullName if provided
        if (registrationRequest.getFullName() != null && !registrationRequest.getFullName().isBlank()) {
            String fullName = registrationRequest.getFullName();
            if (fullName.contains(" ")) {
                user.setFirstName(fullName.substring(0, fullName.lastIndexOf(" ")));
                user.setLastName(fullName.substring(fullName.lastIndexOf(" ") + 1));
            } else {
                user.setFirstName(fullName);
                user.setLastName("");
            }
        }
        
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
        log.info("Authenticating user with identifier: [{}]", loginRequest.getUsername());

        // Find user by username OR email
        User user = userRepository.findByUsernameOrEmail(loginRequest.getUsername(), loginRequest.getUsername())
                .orElseThrow(() -> {
                    log.warn("User not found for identifier: [{}]", loginRequest.getUsername());
                    return new IllegalArgumentException("Incorrect username or password");
                });

        log.info("User found: [{}], Role: [{}]", user.getUsername(), user.getRole());

        if (Boolean.FALSE.equals(user.getIsActive())) {
            log.warn("Inactive user attempted to login: [{}]", loginRequest.getUsername());
            throw new IllegalArgumentException("Tài khoản của bạn đã bị khóa, vui lòng liên hệ Admin");
        }

        // Verify password
        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            log.warn("Password mismatch for user: [{}]", loginRequest.getUsername());
            throw new IllegalArgumentException("Incorrect username or password");
        }

        log.info("Authentication successful for: [{}]", user.getUsername());

        String role = user.getRole().getValue();
        // Generate JWT token
        String token = jwtTokenProvider.generateToken(user.getUsername(), role);
        log.info("JWT token generated for user: {} with role: {}", user.getUsername(), role);

        return new LoginResponse(
                token, 
                role, 
                user.getUsername(), 
                user.getFirstName(), 
                user.getLastName(), 
                user.getImageUrl()
        );
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

    @Transactional
    public void deleteUser(UUID id) {
        log.info("Admin deleting user with ID: {}", id);
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        userRepository.delete(user);
    }

    @Transactional
    public UserResponse toggleUserStatus(UUID id, Authentication authentication) {
        log.info("Admin toggling status for user with ID: {}", id);

        UUID currentUserId = getCurrentUserId(authentication);
        if (id.equals(currentUserId)) {
            throw new IllegalArgumentException("Bạn không thể tự khóa tài khoản của chính mình");
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setIsActive(!user.getIsActive());
        return mapToUserResponse(userRepository.save(user));
    }

    @Transactional
    public UserResponse updateUserRole(UUID id, UserRole role) {
        log.info("Admin updating role to {} for user with ID: {}", role, id);
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setRole(role);
        return mapToUserResponse(userRepository.save(user));
    }
}
