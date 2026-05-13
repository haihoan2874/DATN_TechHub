package com.haihoan2874.techhub.service;

import com.haihoan2874.techhub.dto.request.CreateReviewRequest;
import com.haihoan2874.techhub.dto.response.CreateReviewResponse;
import com.haihoan2874.techhub.dto.response.ReviewResponse;
import com.haihoan2874.techhub.model.Product;
import com.haihoan2874.techhub.model.Review;
import com.haihoan2874.techhub.model.User;
import com.haihoan2874.techhub.repository.ProductRepository;
import com.haihoan2874.techhub.repository.ReviewRepository;
import com.haihoan2874.techhub.repository.UserRepository;
import com.haihoan2874.techhub.security.service.UserService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class ReviewService {
    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final UserService userService;

    @Transactional
    public CreateReviewResponse createReview(UUID productId, CreateReviewRequest request, Authentication authentication) {
        String userName = authentication.getName();
        User user = userRepository.findByUsername(userName)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        UUID userId = user.getId();

        if (reviewRepository.existsByProductIdAndUserId(productId, userId)) {
            throw new RuntimeException("User already reviewed this product");
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new EntityNotFoundException("Product not found"));

        Review review = Review.builder()
                .product(product)
                .user(user)
                .rating(request.getRating())
                .comment(request.getComment())
                .createdAt(LocalDateTime.now())
                .build();

        Review savedReview = reviewRepository.save(review);

        return CreateReviewResponse.builder()
                .id(savedReview.getId())
                .productId(savedReview.getProduct().getId())
                .userId(userId)
                .userName(userName)
                .rating(savedReview.getRating())
                .comment(savedReview.getComment())
                .createdAt(savedReview.getCreatedAt())
                .build();
    }

    public java.util.List<ReviewResponse> getReviewsByProductId(UUID productId) {
        log.info("Fetching reviews for product: {}", productId);
        return reviewRepository.findByProductId(productId).stream()
                .map(this::mapToReviewResponse)
                .collect(java.util.stream.Collectors.toList());
    }

    public java.util.List<ReviewResponse> getAllReviews() {
        log.info("Admin fetching all reviews");
        return reviewRepository.findAllWithProductAndUser().stream()
                .map(this::mapToReviewResponse)
                .collect(java.util.stream.Collectors.toList());
    }

    @Transactional
    public void deleteReview(UUID id) {
        if (!reviewRepository.existsById(id)) {
            throw new EntityNotFoundException("Review not found");
        }
        reviewRepository.deleteById(id);
    }

    private ReviewResponse mapToReviewResponse(Review review) {
        String displayName = (review.getUser().getFirstName() != null ? review.getUser().getFirstName() : "")
                + " " + (review.getUser().getLastName() != null ? review.getUser().getLastName() : "");
        displayName = displayName.trim();
        if (displayName.isEmpty()) {
            displayName = review.getUser().getUsername();
        }

        return ReviewResponse.builder()
                .id(review.getId())
                .productId(review.getProduct().getId())
                .productName(review.getProduct().getName())
                .userId(review.getUser().getId())
                .userName(displayName)
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .build();
    }
}
