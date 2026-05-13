package com.haihoan2874.techhub.controller;

import com.haihoan2874.techhub.dto.request.CreateReviewRequest;
import com.haihoan2874.techhub.dto.response.CreateReviewResponse;
import com.haihoan2874.techhub.dto.response.ReviewResponse;
import com.haihoan2874.techhub.service.ReviewService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import java.util.List;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.UUID;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/reviews")
@Tag(name = "Reviews", description = "Product review management")
public class ReviewController {
    private final ReviewService reviewService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearer")
    @Operation(summary = "Get all reviews", description = "Admin: get all customer reviews")
    public ResponseEntity<List<ReviewResponse>> getAllReviews() {
        return ResponseEntity.ok(reviewService.getAllReviews());
    }

    @SecurityRequirement(name = "bearer")
    @PostMapping("/products/{productId}")
    @Operation(summary = "Create review", description = "Create a review for a product")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Created successfully",
                    content = @Content(schema = @Schema(implementation = CreateReviewResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid input"),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "404", description = "Product or User not found"),
    })
    public ResponseEntity<CreateReviewResponse> createReview(@PathVariable UUID productId,
                                                             @Valid @RequestBody CreateReviewRequest request, Authentication authentication) {
        log.info("Rest request to create a review for product: {}", productId);
        CreateReviewResponse response = reviewService.createReview(productId, request, authentication);

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/products/{productId}")
    @Operation(summary = "Get product reviews", description = "Get all reviews for a specific product")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Retrieved successfully",
                    content = @Content(schema = @Schema(implementation = List.class))),
            @ApiResponse(responseCode = "404", description = "Product not found"),
    })
    public ResponseEntity<List<ReviewResponse>> getReviews(@PathVariable UUID productId) {
        log.info("Rest request to get reviews for product: {}", productId);
        return ResponseEntity.ok(reviewService.getReviewsByProductId(productId));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearer")
    @Operation(summary = "Delete review", description = "Admin: delete an inappropriate review")
    public ResponseEntity<Void> deleteReview(@PathVariable UUID id) {
        reviewService.deleteReview(id);
        return ResponseEntity.noContent().build();
    }
}
