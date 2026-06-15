package com.haihoan2874.techhub.service;

import com.haihoan2874.techhub.dto.response.ProductResponse;
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
import com.haihoan2874.techhub.model.StockImport;
import com.haihoan2874.techhub.repository.BrandRepository;
import com.haihoan2874.techhub.repository.CategoryRepository;
import com.haihoan2874.techhub.repository.ProductRepository;
import com.haihoan2874.techhub.repository.StockImportRepository;
import com.haihoan2874.techhub.security.service.UserService;
import com.haihoan2874.techhub.mapper.ProductMapper;
import com.haihoan2874.techhub.util.SlugUtil;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Locale;
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
    private final StockImportRepository stockImportRepository;
    private final InventoryService inventoryService;
    private final UserService userService;

    // Allowed sort fields
    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of("name", "price", "updatedat");
    private static final String DEFAULT_SORT_FIELD = "updatedAt";

    @Transactional
    public CreateProductResponse createProduct(CreateProductRequest request, Authentication authentication) {
        log.info("Create product request: {}", request.getName());

        validateProductRequest(request, null);
        validateInitialStock(request);

        Product product = new Product();
        ProductMapper.mapRequestToEntity(product, request);
        if (request.getInitialImportPrice() != null) {
            product.setCostPrice(request.getInitialImportPrice());
        }

        // Standardize slug
        String slug = (request.getSlug() == null || request.getSlug().isEmpty())
                ? SlugUtil.generateSlug(request.getName())
                : SlugUtil.generateSlug(request.getSlug());

        if (productRepository.existsBySlug(slug)) {
            slug = slug + "-" + UUID.randomUUID().toString().substring(0, 8);
        }
        product.setSlug(slug);

        product.setCreatedBy(userService.getCurrentUserId(authentication));

        Product saveProduct = productRepository.save(product);
        log.info("Saved product with id: {}", saveProduct.getId());

        int initialStock = request.getStockQuantity() != null ? request.getStockQuantity() : 0;
        LocalDateTime initialImportedAt = initialStock > 0
                ? (request.getInitialImportedAt() != null ? request.getInitialImportedAt() : LocalDateTime.now())
                : null;
        inventoryService.initializeInventory(saveProduct.getId(), initialStock, initialImportedAt);

        if (initialStock > 0) {
            stockImportRepository.save(StockImport.builder()
                    .productId(saveProduct.getId())
                    .quantity(initialStock)
                    .importPrice(request.getInitialImportPrice())
                    .note(request.getInitialImportNote())
                    .importedAt(initialImportedAt)
                    .createdBy(saveProduct.getCreatedBy())
                    .build());
        }

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
                .features(saveProduct.getFeatures())
                .videoUrls(saveProduct.getVideoUrls())
                .createdAt(saveProduct.getCreatedAt())
                .createdBy(saveProduct.getCreatedBy())
                .build();
    }


    public PagingList<ProductResponse> getAllProducts(ProductFilterRequest request) {
        String sortBy = validateAndGetSortBy(request.getSortBy());
        Sort.Direction direction = "asc".equalsIgnoreCase(request.getSortOrder())
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;

        Pageable pageable = PageRequest.of(request.getPageNo(), request.getPageSize(), Sort.by(direction, sortBy));

        ProductFilter filter = ProductFilter.builder()
                .categoryId(request.getCategoryId())
                .brandId(request.getBrandId())
                .name(request.getName())
                .minPrice(request.getMinPrice())
                .maxPrice(request.getMaxPrice())
                .isActive(request.getIsActive())
                .sortBy(sortBy)
                .sortDirection(direction)
                .build();

        Page<ProductResponse> products = productRepository.findProductsByFilter(filter, pageable);

        List<ProductResponse> content = products.getContent().stream()
                .map(ProductMapper::mapToResponse)
                .toList();

        return PagingList.<ProductResponse>builder()
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

        String lowerSortBy = sortBy.toLowerCase(Locale.ROOT);
        if (!ALLOWED_SORT_FIELDS.contains(lowerSortBy)) {
            log.warn("Invalid sortBy field: '{}', using default '{}'", sortBy, DEFAULT_SORT_FIELD);
            return DEFAULT_SORT_FIELD;
        }

        if ("updatedat".equals(lowerSortBy)) {
            return DEFAULT_SORT_FIELD;
        }

        return lowerSortBy;
    }


    public ProductResponse getProductByCondition(String searchBy, String value) {
        if (!List.of("id", "slug").contains(searchBy.toLowerCase(Locale.ROOT))) {
            throw new IllegalArgumentException("Invalid filter parameters");
        }
        log.info("Getting product by {}: {}", searchBy, value);
        return productRepository.findDetailProductByCondition(searchBy, value)
                .map(ProductMapper::mapToResponse)
                .orElseThrow(() -> new EntityNotFoundException("Product not found"));
    }


    public UpdateProductResponse updateProduct(UUID id, UpdateProductRequest request, Authentication authentication) {
        log.info("Update product with id: {}", id);

        Product product = productRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Product not found with id:" + id));

        validateProductRequest(request, id);

        String oldName = product.getName();
        ProductMapper.mapRequestToEntity(product, request);

        // Update slug if name changed or slug is empty
        if (!oldName.equals(request.getName()) || product.getSlug() == null || product.getSlug().isEmpty()) {
            String newSlug = SlugUtil.generateSlug(request.getName());
            if (productRepository.existsBySlug(newSlug)) {
                newSlug = newSlug + "-" + UUID.randomUUID().toString().substring(0, 8);
            }
            product.setSlug(newSlug);
        }

        product.setUpdatedBy(userService.getCurrentUserId(authentication));

        Product savedProduct = productRepository.save(product);
        log.info("Product updated with id: {}", savedProduct.getId());

        return UpdateProductResponse.builder().id(savedProduct.getId()).build();
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

    private void validateInitialStock(CreateProductRequest request) {
        int initialStock = request.getStockQuantity() != null ? request.getStockQuantity() : 0;
        if (initialStock < 0) {
            throw new IllegalArgumentException("Initial stock cannot be negative");
        }
        if (initialStock > 0 && (request.getInitialImportPrice() == null
                || request.getInitialImportPrice().compareTo(BigDecimal.ZERO) <= 0)) {
            throw new IllegalArgumentException("Initial import price is required when initial stock is greater than 0");
        }
        if (request.getInitialImportPrice() != null && request.getInitialImportPrice().compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Initial import price cannot be negative");
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

        // Cập nhật trực tiếp vào inventory - nguồn sự thật duy nhất của tồn kho
        inventoryService.updateStock(id, request.getStockQuantity());

        return UpdateProductStockResponse.builder()
                .id(id)
                .stockQuantity(request.getStockQuantity())
                .updatedAt(java.time.LocalDateTime.now())
                .build();
    }
}
