package com.haihoan2874.techhub.controller;

import com.haihoan2874.techhub.dto.*;
import com.haihoan2874.techhub.dto.core.PagingList;
import com.haihoan2874.techhub.service.ProductService;
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
@RequestMapping("/products")
@Validated
@Tag(name = "Products", description = "Product management endpoints")
public class ProductController {
    private final ProductService productService;

    @PostMapping
    @Operation(summary = "Create product", description = "Create a new product")
    @SecurityRequirement(name = "bearer")
    @PreAuthorize("hasRole('ADMIN')")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Product created successfully",
                    content = @Content(schema = @Schema(implementation = CreateProductResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid input or product name already"),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "404", description = "Category not found")
    })
    public ResponseEntity<CreateProductResponse> createProduct(@Valid @RequestBody CreateProductRequest request, Authentication authentication) {
        log.info("Creating product with name: {}", request.getName());

        CreateProductResponse response = productService.createProduct(request, authentication);

        log.info("Product created with id: {}", response.getId());

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(summary = "Get all products", description = "Get list of products with filtering, sorting and pagination")
    @PreAuthorize("permitAll()")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Products retrieved successfully",
                    content = @Content(schema = @Schema(implementation = PagingList.class))),
            @ApiResponse(responseCode = "400", description = "Invalid filter parameters")
    })
    public ResponseEntity<PagingList<ProductDto>> getAllProducts(ProductFilterRequest request) {
        log.info("Getting all products with filter: {}", request);

        return ResponseEntity.ok(productService.getAllProducts(request));
    }

    @GetMapping("/detail")
    @Operation(summary = "Get product detail", description = "Get product by ID or Slug")
    @PreAuthorize("permitAll()")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Products retrieved successfully",
                    content = @Content(schema = @Schema(implementation = ProductDto.class))),
            @ApiResponse(responseCode = "400", description = "Invalid filter parameters"),
            @ApiResponse(responseCode = "404", description = "Product not found")
    })
    public ResponseEntity<ProductDto> getProductDetail(
            @RequestParam String searchBy,
            @RequestParam String value
    ) {
        log.info("Getting product detail by {}: {}", searchBy, value);

        return ResponseEntity.ok(productService.getProductByCondition(searchBy, value));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update Product")
    @SecurityRequirement(name = "bearer")
    @PreAuthorize("hasRole('ADMIN')")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Product updated successfully",
                    content = @Content(schema = @Schema(implementation = UpdateProductResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid input or product name already exists"),
            @ApiResponse(responseCode = "404", description = "Product not found"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<UpdateProductResponse> updateProduct(@PathVariable UUID id, @Valid @RequestBody UpdateProductRequest request, Authentication authentication) {
        log.info("Updating product with id: {}", id);

        UpdateProductResponse response = productService.updateProduct(id, request, authentication);

        log.info("Product updated successfully with id: {}", id);

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete product")
    @SecurityRequirement(name = "bearer")
    @PreAuthorize("hasRole('ADMIN')")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Product deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Product not found"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<Void> deleteProduct(@PathVariable UUID id, Authentication authentication) {
        log.info("Deleting product with id: {}", id);

        productService.deleteProduct(id, authentication);

        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/stock")
    @Operation(summary = "Update product stock quantity")
    @SecurityRequirement(name = "bearer")
    @PreAuthorize("hasRole('ADMIN')")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Stock updated successfully",
                    content = @Content(schema = @Schema(implementation = UpdateProductStockResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid input"),
            @ApiResponse(responseCode = "404", description = "Product not found"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<UpdateProductStockResponse> updateProductStock(@PathVariable UUID id, @Valid @RequestBody UpdateProductStockRequest request, Authentication authentication) {
        log.info("Updating product with id: {}, newStock={}", id, request.getStockQuantity());

        UpdateProductStockResponse response = productService.updateProductStock(request, id, authentication);

        return ResponseEntity.ok(response);
    }
}
