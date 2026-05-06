package com.haihoan2874.techhub.exceptions;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import jakarta.servlet.http.HttpServletRequest;

import java.time.LocalDateTime;

/**
 * Global Exception Handler for authentication and registration errors.
 */
@Slf4j
@RestControllerAdvice
public class AuthenticationAdvice {

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiExceptionResponse> handleAuthenticationException(
            IllegalArgumentException ex,
            HttpServletRequest request) {

        log.error("Authentication error: {}", ex.getMessage());

        ApiExceptionResponse response = ApiExceptionResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .message(ex.getMessage())
                .path(request.getServletPath())
                .build();

        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(jakarta.persistence.EntityNotFoundException.class)
    public ResponseEntity<ApiExceptionResponse> handleEntityNotFoundException(
            jakarta.persistence.EntityNotFoundException ex,
            HttpServletRequest request) {

        log.error("Resource not found: {}", ex.getMessage());

        ApiExceptionResponse response = ApiExceptionResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.NOT_FOUND.value())
                .message(ex.getMessage())
                .path(request.getServletPath())
                .build();

        return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ApiExceptionResponse> handleRuntimeException(
            RuntimeException ex,
            HttpServletRequest request) {

        log.error("Runtime error: {}", ex.getMessage());

        ApiExceptionResponse response = ApiExceptionResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                .message("An error occurred: " + ex.getMessage())
                .path(request.getServletPath())
                .build();

        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiExceptionResponse> handleAccessDeniedException(
            AccessDeniedException ex,
            HttpServletRequest request) {
        log.error("Access denied error: {}", ex.getMessage());

        ApiExceptionResponse response = ApiExceptionResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.FORBIDDEN.value())
                .message("You don't have permission to access this resource" + ex.getMessage())
                .path(request.getServletPath())
                .build();
        return new ResponseEntity<>(response, HttpStatus.FORBIDDEN);
    }
}

