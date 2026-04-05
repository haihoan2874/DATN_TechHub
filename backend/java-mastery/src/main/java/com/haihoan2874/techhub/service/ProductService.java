package com.haihoan2874.techhub.service;

import com.haihoan2874.techhub.dto.response.ProductDto;
import com.haihoan2874.techhub.dto.request.CreateProductRequest;
import com.haihoan2874.techhub.dto.request.UpdateProductRequest;
import com.haihoan2874.techhub.dto.request.UpdateProductStockRequest;
import com.haihoan2874.techhub.dto.request.ProductFilter;
import com.haihoan2874.techhub.dto.request.ProductFilterRequest;
import com.haihoan2874.techhub.dto.response.CreateProductResponse;
import com.haihoan2874.techhub.dto.response.UpdateProductResponse;
import com.haihoan2874.techhub.dto.response.UpdateProductStockResponse;
import com.haihoan2874.techhub.dto.request.base.BaseProductRequest;
import com.haihoan2874.techhub.dto.core.PagingList;
import com.haihoan2874.techhub.model.Product;
import com.haihoan2874.techhub.repository.BrandRepository;
import com.haihoan2874.techhub.repository.CategoryRepository;
import com.haihoan2874.techhub.repository.ProductRepository;
import com.haihoan2874.techhub.security.service.UserService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductService {
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;
    private final InventoryService inventoryService;
    private final UserService userService;

    // Allowed sort fields
    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of("name", "price", "updatedAt");
    private static final String DEFAULT_SORT_FIELD = "updatedAt";

    public CreateProductResponse createProduct(CreateProductRequest request, Authentication authentication) {
        log.info("Create product request: {}", request.getName());

        validateProductRequest(request, null);

        Product product = new Product();
        mapRequestToEntity(product, request);

        product.setCreatedBy(userService.getCurrentUserId(authentication));

        Product saveProduct = productRepository.save(product);
        log.info("Saved product with id: {}", saveProduct.getId());

        // Initialize inventory
        inventoryService.initializeInventory(saveProduct.getId(), saveProduct.getStockQuantity());

        return CreateProductResponse.builder()
                .id(saveProduct.getId())
                .categoryId(saveProduct.getCategoryId())
                .name(saveProduct.getName())
                .slug(saveProduct.getSlug())
                .description(saveProduct.getDescription())
                .price(saveProduct.getPrice())
                .imageUrl(saveProduct.getImageUrl())
                .isActive(saveProduct.getIsActive())
                .brandId(saveProduct.getBrandId())
                .specs(saveProduct.getSpecs())
                .videoUrls(saveProduct.getVideoUrls())
                .createdAt(saveProduct.getCreatedAt())
                .createdBy(saveProduct.getCreatedBy())
                .build();
    }


    public PagingList<ProductDto> getAllProducts(ProductFilterRequest request) {
        String sortBy = validateAndGetSortBy(request.getSortBy());
        Sort.Direction direction = "asc".equalsIgnoreCase(request.getSortOrder())
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;

        Pageable pageable = PageRequest.of(request.getPageNo(), request.getPageSize(), Sort.by(direction, sortBy));

        ProductFilter filter = ProductFilter.builder()
                .categoryId(request.getCategoryId())
                .name(request.getName())
                .minPrice(request.getMinPrice())
                .maxPrice(request.getMaxPrice())
                .isActive(request.getIsActive())
                .sortBy(sortBy)
                .sortDirection(direction)
                .build();

        Page<ProductDto> products = productRepository.findProductsByFilter(filter, pageable);

        List<ProductDto> content = products.getContent().stream()
                .map(this::mapToDto)
                .toList();

        return PagingList.<ProductDto>builder()
                .contents(content)
                .page(request.getPageNo())
                .size(request.getPageSize())
                .total((int) products.getTotalElements())
                .totalPages(products.getTotalPages())
                .build();
    }

    /**
     * Validate and return the sortBy field. Falls back to default if invalid.
     */
    private String validateAndGetSortBy(String sortBy) {
        if (sortBy == null || sortBy.isEmpty()) {
            return DEFAULT_SORT_FIELD;
        }

        String lowerSortBy = sortBy.toLowerCase();
        if (!ALLOWED_SORT_FIELDS.contains(lowerSortBy)) {
            log.warn("Invalid sortBy field: '{}', using default '{}'", sortBy, DEFAULT_SORT_FIELD);
            return DEFAULT_SORT_FIELD;
        }

        return lowerSortBy;
    }

    /**
     * Map ProductDto to ProductDto with additional fields
     */
    private ProductDto mapToDto(ProductDto productDto) {
        // Set default values for rating and reviews
        // TODO: Calculate actual average rating and review count from reviews table
        productDto.setAverageRating(5.0);
        productDto.setReviewCount(10);
        return productDto;
    }

    public ProductDto getProductByCondition(String searchBy, String value) {
        if (!List.of("id", "slug").contains(searchBy.toLowerCase())) {
            throw new IllegalArgumentException("Invalid filter parameters");
        }
        log.info("Getting product by {}: {}", searchBy, value);
        return productRepository.findDetailProductByCondition(searchBy, value)
                .map(this::mapToDto)
                .orElseThrow(() -> new EntityNotFoundException("Product not found"));
    }


    public UpdateProductResponse updateProduct(UUID id, UpdateProductRequest request, Authentication authentication) {
        log.info("Update product with id: {}", id);

        Product product = productRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Product not found with id:" + id));

        validateProductRequest(request, id);

        mapRequestToEntity(product, request);
        product.setUpdatedBy(userService.getCurrentUserId(authentication));

        Product savedProduct = productRepository.save(product);
        log.info("Product updated with id: {}", savedProduct.getId());

        return UpdateProductResponse.builder().id(savedProduct.getId()).build();
    }

    private void mapRequestToEntity(Product product, BaseProductRequest request) {
        product.setName(request.getName());
        product.setSlug(request.getSlug());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setImageUrl(request.getImageUrl());
        product.setStockQuantity(request.getStockQuantity());
        product.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);
        product.setCategoryId(request.getCategoryId());
        product.setBrandId(request.getBrandId());
        product.setSpecs(request.getSpecs());
        product.setVideoUrls(request.getVideoUrls());
    }

    private void validateProductRequest(BaseProductRequest request, UUID productId) {
        if (!categoryRepository.existsById(request.getCategoryId())) {
            throw new EntityNotFoundException("Category not found with id: " + request.getCategoryId());
        }

        if (request.getBrandId() != null && !brandRepository.existsById(request.getBrandId())) {
            throw new EntityNotFoundException("Brand not found with id: " + request.getBrandId());
        }

        Boolean isNameExist;
        if (productId == null) {
            isNameExist = productRepository.existsByName(request.getName());
        } else {
            isNameExist = productRepository.existsByNameAndIdNot(request.getName(), productId);
        }

        if (isNameExist) {
            log.info("Product name already exists:{}", request.getName());
            throw new IllegalArgumentException("Product name already exists");
        }
    }

    public void deleteProduct(UUID id, Authentication authentication) {
        log.info("Delete product with id: {}", id);

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Product not found with id: " + id));

        if (Boolean.FALSE.equals(product.getIsActive())) {
            log.warn("Delete product with active is false");
            throw new IllegalArgumentException("Product is already deleted");
        }
        product.setIsActive(false);

        product.setUpdatedBy(userService.getCurrentUserId(authentication));

        productRepository.save(product);
        log.info("Soft deleted product with id: {}", id);
    }

    public UpdateProductStockResponse updateProductStock(UpdateProductStockRequest request, UUID id, Authentication authentication) {
        log.info("Request stock request for product id: {}", id);

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Product not found with id: " + id));

        product.setUpdatedBy(userService.getCurrentUserId(authentication));

        product.setStockQuantity(request.getStockQuantity());

        Product savedProduct = productRepository.save(product);

        // Update inventory source of truth
        inventoryService.updateStock(savedProduct.getId(), savedProduct.getStockQuantity());

        return UpdateProductStockResponse.builder()
                .id(savedProduct.getId())
                .stockQuantity(savedProduct.getStockQuantity())
                .updatedAt(savedProduct.getUpdatedAt())
                .build();
    }
}

