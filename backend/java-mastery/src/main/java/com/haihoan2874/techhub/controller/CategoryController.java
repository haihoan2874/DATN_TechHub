package com.haihoan2874.techhub.controller;

import com.haihoan2874.techhub.dto.CategoryFilterRequest;
import com.haihoan2874.techhub.dto.CreateCategoryRequest;
import com.haihoan2874.techhub.dto.CreateCategoryResponse;
import com.haihoan2874.techhub.dto.core.PagingList;
import com.haihoan2874.techhub.model.Category;
import com.haihoan2874.techhub.dto.UpdateCategoryRequest;
import com.haihoan2874.techhub.dto.UpdateCategoryResponse;
import com.haihoan2874.techhub.service.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/categories")
@Validated
@Tag(name = "Categories", description = "Category management endpoints")
public class CategoryController {
    private final CategoryService categoryService;

    @PostMapping
    @Operation(summary = "Create category", description = "Create a new category")
    @SecurityRequirement(name = "bearer")
    @PreAuthorize("hasRole('ADMIN')")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Category created successfully",
                    content = @Content(schema = @Schema(implementation = CreateCategoryResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid input or category name already exists"),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "403", description = "Forbidden")
    })
    public ResponseEntity<CreateCategoryResponse> createCategory(@Valid @RequestBody CreateCategoryRequest request, Authentication authentication) {
        log.info("Creating category with name: {}", request.getName());

        CreateCategoryResponse response = categoryService.createCategory(request, authentication);

        log.info("Category created with id: {}", response.getId());

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(summary = "Get all category")
    @PreAuthorize("permitAll()")
    public ResponseEntity<PagingList<Category>> getAllCategories(CategoryFilterRequest request) {
        log.info("Getting all categories with request: {}", request);

        return ResponseEntity.ok(categoryService.getCategories(request));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get category detail ", description = "Get detail info of a category by ID")
    @PreAuthorize("permitAll()")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Successfully category detail"),
            @ApiResponse(responseCode = "404", description = "Category not found")
    })
    public ResponseEntity<Category> getCategoryById(@PathVariable UUID id) {
        log.info("Getting category with id: {}", id);

        return ResponseEntity.ok(categoryService.getCategoryById(id));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update category")
    @SecurityRequirement(name = "bearer")
    @PreAuthorize("hasRole('ADMIN')")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Category updated successfully",
                    content = @Content(schema = @Schema(implementation = UpdateCategoryResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid input or category name already exists"),
            @ApiResponse(responseCode = "403", description = "Forbidden"),
            @ApiResponse(responseCode = "404", description = "Category not found"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<UpdateCategoryResponse> updateCategory(@PathVariable UUID id, @Valid @RequestBody UpdateCategoryRequest request, Authentication authentication) {
        log.info("Updating category with name: {}", request.getName());

        UpdateCategoryResponse response = categoryService.updateCategory(id, request, authentication);

        log.info("Category updated with id: {}", response.getId());

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete category")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearer")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Category deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Category not found"),
            @ApiResponse(responseCode = "403", description = "Forbidden"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<Void> deleteCategory(@PathVariable UUID id, Authentication authentication) {
        log.info("Deleting category with id: {}", id);

        categoryService.deleteCategory(id);

        return ResponseEntity.noContent().build();
    }
}
