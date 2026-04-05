package com.haihoan2874.techhub.controller;

import com.haihoan2874.techhub.dto.response.BrandResponse;
import com.haihoan2874.techhub.dto.request.CreateBrandRequest;
import com.haihoan2874.techhub.dto.request.UpdateBrandRequest;
import com.haihoan2874.techhub.service.BrandService;
import io.swagger.v3.oas.annotations.Operation;
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
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/brands")
@RequiredArgsConstructor
@Tag(name = "Brands", description = "Brand management endpoints")
public class BrandController {
    private final BrandService brandService;

    @PostMapping
    @Operation(summary = "Create brand", description = "Create a new brand (Admin only)")
    @SecurityRequirement(name = "bearer")
    @PreAuthorize("hasRole('ADMIN')")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Brand created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid input or slug already exists"),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "403", description = "Forbidden")
    })
    public ResponseEntity<BrandResponse> createBrand(@Valid @RequestBody CreateBrandRequest request, Authentication authentication) {
        log.info("Creating brand: {}", request.getName());
        return new ResponseEntity<>(brandService.createBrand(request, authentication), HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(summary = "Get all brands", description = "Retrieve list of all active brands")
    @PreAuthorize("permitAll()")
    public ResponseEntity<List<BrandResponse>> getAllBrands() {
        log.info("Getting all brands");
        return ResponseEntity.ok(brandService.getAllBrands());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get brand detail", description = "Get brand information by ID")
    @PreAuthorize("permitAll()")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Successfully retrieved brand"),
            @ApiResponse(responseCode = "404", description = "Brand not found")
    })
    public ResponseEntity<BrandResponse> getBrandById(@PathVariable UUID id) {
        log.info("Getting brand detail for id: {}", id);
        return ResponseEntity.ok(brandService.getBrandById(id));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update brand", description = "Update brand information (Admin only)")
    @SecurityRequirement(name = "bearer")
    @PreAuthorize("hasRole('ADMIN')")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Brand updated successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid input or slug already exists"),
            @ApiResponse(responseCode = "404", description = "Brand not found"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<BrandResponse> updateBrand(@PathVariable UUID id, @Valid @RequestBody UpdateBrandRequest request, Authentication authentication) {
        log.info("Updating brand id: {}", id);
        return ResponseEntity.ok(brandService.updateBrand(id, request, authentication));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete brand", description = "Delete a brand by ID (Admin only. Refused if products exist)")
    @SecurityRequirement(name = "bearer")
    @PreAuthorize("hasRole('ADMIN')")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Brand deleted successfully"),
            @ApiResponse(responseCode = "400", description = "Cannot delete brand (associated products found)"),
            @ApiResponse(responseCode = "404", description = "Brand not found"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<Void> deleteBrand(@PathVariable UUID id, Authentication authentication) {
        log.info("Deleting brand id: {}", id);
        brandService.deleteBrand(id);
        return ResponseEntity.noContent().build();
    }
}
