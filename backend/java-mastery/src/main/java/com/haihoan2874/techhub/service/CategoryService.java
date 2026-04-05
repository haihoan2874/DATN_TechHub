package com.haihoan2874.techhub.service;

import com.haihoan2874.techhub.dto.request.CategoryFilterRequest;
import com.haihoan2874.techhub.dto.request.CreateCategoryRequest;
import com.haihoan2874.techhub.dto.response.CreateCategoryResponse;
import com.haihoan2874.techhub.dto.request.UpdateCategoryRequest;
import com.haihoan2874.techhub.dto.response.UpdateCategoryResponse;
import com.haihoan2874.techhub.dto.core.PagingList;
import com.haihoan2874.techhub.model.Category;
import com.haihoan2874.techhub.repository.CategoryRepository;
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

@Slf4j
@Service
@RequiredArgsConstructor
public class CategoryService {
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    @Transactional
    public CreateCategoryResponse createCategory(CreateCategoryRequest request, Authentication authentication) {
        log.info("Creating new category with name: {}", request.getName());

        if (categoryRepository.existsByName(request.getName())) {
            log.error("Category name already exists: {}", request.getName());
            throw new IllegalArgumentException("Category name already exists");
        }

        Category category = Category.builder().name(request.getName()).description(request.getDescription()).icon(request.getIcon()).build();

        if (authentication != null && authentication.isAuthenticated()) {
            String username = authentication.getName();
            userRepository.findByUsername(username).ifPresent(user -> {
                category.setCreatedBy(user.getId());
            });
        }

        Category savedCategory = categoryRepository.save(category);
        log.info("Category created with id: {}", savedCategory.getId());

        return CreateCategoryResponse.builder().id(savedCategory.getId()).build();
    }

    public PagingList<Category> getCategories(CategoryFilterRequest request) {
        Pageable pageable = PageRequest.of(request.getPageNo(), request.getPageSize());

        Page<Category> categoryPage = categoryRepository.findCategoriesByFilter(request.getFilter(), pageable);

        return PagingList.<Category>builder()
                .contents(categoryPage.getContent())
                .page(request.getPageNo())
                .size(request.getPageSize())
                .total((int) categoryPage.getTotalElements())
                .totalPages(categoryPage.getTotalPages())
                .build();
    }

    public Category getCategoryById(UUID id) {
        log.info("Getting category with id: {}", id);

        return categoryRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Category with id: " + id));
    }

    public UpdateCategoryResponse updateCategory(UUID id, UpdateCategoryRequest request, Authentication authentication) {
        log.info("Updating category with id: {}", id);

        Category category = categoryRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Category not found with id:" + id));

        if (!category.getName().equalsIgnoreCase(request.getName()) && categoryRepository.existsByNameAndIdNot(request.getName(), id)) {
            throw new IllegalArgumentException("Category name already exists");
        }

        category.setName(request.getName());
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

    public void deleteCategory(UUID id){
        log.info("Deleting category with id: {}", id);

        if (!categoryRepository.existsById(id)){
            log.error("Category with id: {} does not exist", id);
            throw new IllegalArgumentException("Category with id: " + id + " does not exist");
        }

        categoryRepository.deleteById(id);
        log.info("Category deleted with id: {}", id);
    }
}
