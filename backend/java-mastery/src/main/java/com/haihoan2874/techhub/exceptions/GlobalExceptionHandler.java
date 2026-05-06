package com.haihoan2874.techhub.exceptions;

import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;

/**
 * Global Exception Handler for capturing all API exceptions.
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ApiExceptionResponse> handleEntityNotFound(EntityNotFoundException ex, HttpServletRequest request) {
        log.error("Entity not found: {}", ex.getMessage());
        return createResponse(HttpStatus.NOT_FOUND, ex.getMessage(), request);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiExceptionResponse> handleBadCredentials(BadCredentialsException ex, HttpServletRequest request) {
        log.error("Authentication failed: {}", ex.getMessage());
        return createResponse(HttpStatus.UNAUTHORIZED, "Email hoặc mật khẩu không chính xác", request);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiExceptionResponse> handleAccessDenied(AccessDeniedException ex, HttpServletRequest request) {
        log.error("Access denied: {}", ex.getMessage());
        return createResponse(HttpStatus.FORBIDDEN, "Bạn không có quyền thực hiện hành động này", request);
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ApiExceptionResponse> handleIllegalState(IllegalStateException ex, HttpServletRequest request) {
        log.error("Illegal state: {}", ex.getMessage());
        return createResponse(HttpStatus.BAD_REQUEST, ex.getMessage(), request);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiExceptionResponse> handleGeneralException(Exception ex, HttpServletRequest request) {
        log.error("Internal Server Error: ", ex);
        return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Đã có lỗi hệ thống xảy ra. Vui lòng thử lại sau.", request);
    }

    private ResponseEntity<ApiExceptionResponse> createResponse(HttpStatus status, String message, HttpServletRequest request) {
        ApiExceptionResponse response = ApiExceptionResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(status.value())
                .message(message)
                .path(request.getRequestURI())
                .build();
        return new ResponseEntity<>(response, status);
    }
}
