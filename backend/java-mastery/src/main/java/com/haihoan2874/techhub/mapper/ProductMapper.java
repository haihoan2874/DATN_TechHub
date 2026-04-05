package com.haihoan2874.techhub.mapper;

import com.haihoan2874.techhub.dto.request.base.BaseProductRequest;
import com.haihoan2874.techhub.dto.response.ProductResponse;
import com.haihoan2874.techhub.model.Product;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;

/**
 * Mapper for Product entity and DTOs.
 */
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class ProductMapper {

    public static void mapRequestToEntity(Product product, BaseProductRequest request) {
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setImageUrl(request.getImageUrl());
        product.setStockQuantity(request.getStockQuantity());
        product.setIsActive(!Boolean.FALSE.equals(request.getIsActive()));
        product.setCategoryId(request.getCategoryId());
        product.setBrandId(request.getBrandId());
        product.setSpecs(request.getSpecs());
        product.setVideoUrls(request.getVideoUrls());
    }

    public static ProductResponse mapToResponse(ProductResponse productResponse) {
        // Set default values for rating and reviews
        // TODO: Calculate actual average rating and review count from reviews table
        productResponse.setAverageRating(5.0);
        productResponse.setReviewCount(10);
        return productResponse;
    }
}
