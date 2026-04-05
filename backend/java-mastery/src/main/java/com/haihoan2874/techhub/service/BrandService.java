package com.haihoan2874.techhub.service;

import com.haihoan2874.techhub.dto.response.BrandResponse;
import com.haihoan2874.techhub.dto.request.CreateBrandRequest;
import com.haihoan2874.techhub.dto.request.UpdateBrandRequest;
import com.haihoan2874.techhub.model.Brand;
import com.haihoan2874.techhub.repository.BrandRepository;
import jakarta.persistence.EntityNotFoundException;
import com.haihoan2874.techhub.repository.ProductRepository;
import com.haihoan2874.techhub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class BrandService {
    private final BrandRepository brandRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    @Transactional
    public BrandResponse createBrand(CreateBrandRequest request, Authentication authentication) {
        log.info("Creating brand: {}", request.getName());

        if (brandRepository.existsBySlug(request.getSlug())) {
            throw new IllegalArgumentException("Brand with slug already exists: " + request.getSlug());
        }

        Brand brand = Brand.builder()
                .name(request.getName())
                .slug(request.getSlug())
                .description(request.getDescription())
                .logoUrl(request.getLogoUrl())
                .isActive(true)
                .build();

        if (authentication != null && authentication.isAuthenticated()) {
            userRepository.findByUsername(authentication.getName()).ifPresent(user -> {
                brand.setCreatedBy(user.getId());
                brand.setUpdatedBy(user.getId());
            });
        }

        Brand savedBrand = brandRepository.save(brand);
        return mapToResponse(savedBrand);
    }

    public List<BrandResponse> getAllBrands() {
        return brandRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public BrandResponse getBrandById(UUID id) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Brand not found with id: " + id));
        return mapToResponse(brand);
    }

    @Transactional
    public BrandResponse updateBrand(UUID id, UpdateBrandRequest request, Authentication authentication) {
        log.info("Updating brand with id: {}", id);

        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Brand not found with id: " + id));

        if (!brand.getSlug().equals(request.getSlug()) && brandRepository.existsBySlug(request.getSlug())) {
            throw new IllegalArgumentException("Brand with slug already exists: " + request.getSlug());
        }

        brand.setName(request.getName());
        brand.setSlug(request.getSlug());
        brand.setDescription(request.getDescription());
        brand.setLogoUrl(request.getLogoUrl());
        brand.setIsActive(request.getIsActive() != null ? request.getIsActive() : brand.getIsActive());

        if (authentication != null && authentication.isAuthenticated()) {
            userRepository.findByUsername(authentication.getName()).ifPresent(user -> {
                brand.setUpdatedBy(user.getId());
            });
        }

        Brand updatedBrand = brandRepository.save(brand);
        return mapToResponse(updatedBrand);
    }

    @Transactional
    public void deleteBrand(UUID id) {
        log.info("Deleting brand with id: {}", id);
        
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Brand not found with id: " + id));

        if (productRepository.existsByBrandId(id)) {
            log.error("Cannot delete brand id: {} as it has associated products", id);
            throw new IllegalStateException("Cannot delete brand as it has associated products. Please delete or move products first.");
        }

        brandRepository.delete(brand);
    }

    private BrandResponse mapToResponse(Brand brand) {
        return BrandResponse.builder()
                .id(brand.getId())
                .name(brand.getName())
                .slug(brand.getSlug())
                .description(brand.getDescription())
                .logoUrl(brand.getLogoUrl())
                .isActive(brand.getIsActive())
                .createdAt(brand.getCreatedAt())
                .updatedAt(brand.getUpdatedAt())
                .build();
    }
}
