package com.haihoan2874.techhub.controller;

import com.haihoan2874.techhub.dto.CreateCustomerAddressRequest;
import com.haihoan2874.techhub.dto.CreateCustomerAddressResponse;
import com.haihoan2874.techhub.dto.UpdateCustomerAddressRequest;
import com.haihoan2874.techhub.dto.UpdateCustomerAddressResponse;
import com.haihoan2874.techhub.dto.GetDetailCustomerAddressResponse;
import com.haihoan2874.techhub.dto.GetListCustomerAddressResponse;
import com.haihoan2874.techhub.dto.SetDefaultAddressResponse;
import com.haihoan2874.techhub.service.CustomerAddressService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;
import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/addresses")
@SecurityRequirement(name = "bearer")
public class CustomerAddressController {
    private final CustomerAddressService customerAddressService;

    @PostMapping
    @Operation(summary = "Create customer address", description = "Create a new customer address")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Customer address created successfully",
                    content = @Content(schema = @Schema(implementation = CreateCustomerAddressResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid input"),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "404", description = "User not found")
    })
    public ResponseEntity<CreateCustomerAddressResponse> createCustomerAddress(@Valid @RequestBody CreateCustomerAddressRequest request, Authentication authentication) {
        log.info("Creating customer address with name customer: {}", request.getFullName());

        CreateCustomerAddressResponse response = customerAddressService.createCustomerAddress(request, authentication);

        log.info("Customer address created with id: {}", response.getId());

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(summary = "Get all my address")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Address retrieved successfully",
                    content = @Content(schema = @Schema(implementation = GetListCustomerAddressResponse.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<List<GetListCustomerAddressResponse>> getMyAddresses(Authentication authentication) {
        log.info("Getting all my address with user: {}", authentication.getName());

        return ResponseEntity.ok(customerAddressService.getMyAddresses(authentication));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get address by id", description = "Get a customer address by its ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Customer address retrieved successfully",
                    content = @Content(schema = @Schema(implementation = GetDetailCustomerAddressResponse.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "404", description = "Customer address not found")
    })
    public ResponseEntity<GetDetailCustomerAddressResponse> getAddressByid(@PathVariable UUID id, Authentication authentication) {
        return ResponseEntity.ok(customerAddressService.getAddressById(id, authentication));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update customer address", description = "Update an existing customer address")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Customer address updated successfully",
                    content = @Content(schema = @Schema(implementation = UpdateCustomerAddressResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid input"),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "404", description = "Customer address not found")
    })
    public ResponseEntity<UpdateCustomerAddressResponse> updateCustomerAddress(@PathVariable UUID id, @Valid @RequestBody UpdateCustomerAddressRequest request, Authentication authentication) {
        log.info("Updating customer address with name customer: {}", request.getFullName());

        UpdateCustomerAddressResponse response = customerAddressService.updateCustomerAddress(id, request, authentication);

        log.info("Customer address updated with id: {}", response.getId());

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete customer address", description = "Delete a customer address by ID")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Customer address deleted successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "404", description = "Customer address not found")
    })
    public ResponseEntity<Void> deleteCustomerAddress(@PathVariable UUID id, Authentication authentication) {
        customerAddressService.deleteCustomerAddress(id, authentication);

        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/default")
    @Operation(summary = "Set default address")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Default address set successfully",
                    content = @Content(schema = @Schema(implementation = SetDefaultAddressResponse.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "404", description = "Customer address not found")
    })
    public ResponseEntity<SetDefaultAddressResponse> setDefaultAddress(@PathVariable UUID id, Authentication authentication) {
        SetDefaultAddressResponse response = customerAddressService.setDefaultAddress(id, authentication);

        return ResponseEntity.ok(response);
    }
}

