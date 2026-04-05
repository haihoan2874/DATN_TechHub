package com.haihoan2874.techhub.service;

import com.haihoan2874.techhub.dto.request.CategoryFilterRequest;
import com.haihoan2874.techhub.dto.request.CreateCategoryRequest;
import com.haihoan2874.techhub.dto.response.CategoryResponse;
import com.haihoan2874.techhub.dto.response.CreateCategoryResponse;
import com.haihoan2874.techhub.dto.request.UpdateCategoryRequest;
import com.haihoan2874.techhub.dto.response.UpdateCategoryResponse;
import com.haihoan2874.techhub.dto.core.PagingList;
import com.haihoan2874.techhub.model.Category;
import com.haihoan2874.techhub.repository.CategoryRepository;
import com.haihoan2874.techhub.repository.ProductRepository;
import com.haihoan2874.techhub.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CategoryService {
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    @Transactional
    public CreateCategoryResponse createCategory(CreateCategoryRequest request, Authentication authentication) {
        log.info("Creating new category with name: {}", request.getName());

        if (categoryRepository.existsByName(request.getName())) {
            log.error("Category name already exists: {}", request.getName());
            throw new IllegalArgumentException("Category name already exists");
        }

        String slug = generateSlug(request.getName());
        if (categoryRepository.existsBySlug(slug)) {
            slug = slug + "-" + UUID.randomUUID().toString().substring(0, 8);
        }

        Category category = Category.builder()
                .name(request.getName())
                .slug(slug)
                .description(request.getDescription())
                .icon(request.getIcon())
                .isActive(true)
                .build();

        if (authentication != null && authentication.isAuthenticated()) {
            String username = authentication.getName();
            userRepository.findByUsername(username).ifPresent(user -> {
                category.setCreatedBy(user.getId());
                category.setUpdatedBy(user.getId());
            });
        }

        Category savedCategory = categoryRepository.save(category);
        log.info("Category created with id: {}", savedCategory.getId());

        return CreateCategoryResponse.builder().id(savedCategory.getId()).build();
    }

    public PagingList<CategoryResponse> getCategories(CategoryFilterRequest request) {
        Pageable pageable = PageRequest.of(request.getPageNo(), request.getPageSize());

        Page<Category> categoryPage = categoryRepository.findCategoriesByFilter(request.getFilter(), pageable);

        return PagingList.<CategoryResponse>builder()
                .contents(categoryPage.getContent().stream()
                        .map(this::mapToResponse)
                        .collect(Collectors.toList()))
                .page(request.getPageNo())
                .size(request.getPageSize())
                .total((int) categoryPage.getTotalElements())
                .totalPages(categoryPage.getTotalPages())
                .build();
    }

    public CategoryResponse getCategoryById(UUID id) {
        log.info("Getting category with id: {}", id);

        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Category with id: " + id));
        
        return mapToResponse(category);
    }

    @Transactional
    public UpdateCategoryResponse updateCategory(UUID id, UpdateCategoryRequest request, Authentication authentication) {
        log.info("Updating category with id: {}", id);

        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Category not found with id:" + id));

        if (!category.getName().equalsIgnoreCase(request.getName())) {
            if (categoryRepository.existsByNameAndIdNot(request.getName(), id)) {
                throw new IllegalArgumentException("Category name already exists");
            }
            category.setName(request.getName());
            category.setSlug(generateSlug(request.getName()));
        }

        category.setDescription(request.getDescription());
        category.setIcon(request.getIcon());

        if (authentication != null && authentication.isAuthenticated()) {
            String username = authentication.getName();
            userRepository.findByUsername(username).ifPresent(user -> {
                category.setUpdatedBy(user.getId());
            });
        }
        Category savedCategory = categoryRepository.save(category);
        log.info("Category updated with id: {}", savedCategory.getId());

        return UpdateCategoryResponse.builder().id(savedCategory.getId()).build();
    }

    @Transactional
    public void deleteCategory(UUID id) {
        log.info("Deleting category with id: {}", id);

        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Category not found with id: " + id));

        if (productRepository.existsByCategoryId(id)) {
            log.error("Cannot delete category with id: {} as it has associated products", id);
            throw new IllegalStateException("Cannot delete category source it has associated products. Please delete or move products first.");
        }

        categoryRepository.delete(category);
        log.info("Category deleted with id: {}", id);
    }

    private CategoryResponse mapToResponse(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .slug(category.getSlug())
                .description(category.getDescription())
                .icon(category.getIcon())
                .isActive(category.getIsActive())
                .createdAt(category.getCreatedAt())
                .createdBy(category.getCreatedBy())
                .updatedAt(category.getUpdatedAt())
                .updatedBy(category.getUpdatedBy())
                .build();
    }

    private String generateSlug(String input) {
        if (input == null || input.isEmpty()) {
            return "";
        }
        return input.toLowerCase()
                .replaceAll("[^a-z0-9\\s]", "")
                .replaceAll("\\s+", "-");
    }
}
