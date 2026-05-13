package com.haihoan2874.techhub.controller;

import com.haihoan2874.techhub.constant.APIConstants;
import com.haihoan2874.techhub.dto.response.CartResponse;
import com.haihoan2874.techhub.service.CartService;
import com.haihoan2874.techhub.security.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * REST Controller for shopping cart management.
 * All endpoints require user authentication.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/cart")
@RequiredArgsConstructor
@Tag(name = "Cart", description = "Shopping cart management endpoints (Requires Login)")
@SecurityRequirement(name = APIConstants.BEARER)
public class CartController {

    private final CartService cartService;
    private final UserService userService;

    /**
     * Get the current user's shopping cart.
     *
     * @param authentication the current authentication
     * @return the cart response
     */
    @GetMapping
    @Operation(summary = "Get current cart", description = "Retrieve the shopping cart for the authenticated user")
    @ApiResponses({
        @ApiResponse(responseCode = APIConstants.OK, description = "Cart retrieved successfully"),
        @ApiResponse(responseCode = APIConstants.UNAUTHORIZED, description = APIConstants.MSG_UNAUTHORIZED)
    })
    public ResponseEntity<CartResponse> getCart(Authentication authentication) {
        UUID userId = userService.getCurrentUserId(authentication);
        return ResponseEntity.ok(cartService.getCart(userId.toString()));
    }

    /**
     * Add a product to the cart.
     *
     * @param productId the product ID to add
     * @param quantity the quantity to add
     * @param authentication the current authentication
     * @return the updated cart response
     */
    @PostMapping("/add")
    @Operation(summary = "Add item to cart", description = "Add a specific product and quantity to the cart")
    @ApiResponses({
        @ApiResponse(responseCode = APIConstants.OK, description = "Item added successfully"),
        @ApiResponse(responseCode = APIConstants.UNAUTHORIZED, description = APIConstants.MSG_UNAUTHORIZED),
        @ApiResponse(responseCode = APIConstants.NOT_FOUND, description = "Product not found")
    })
    public ResponseEntity<CartResponse> addToCart(
            @RequestParam UUID productId,
            @RequestParam(defaultValue = "1") Integer quantity,
            Authentication authentication) {
        UUID userId = userService.getCurrentUserId(authentication);
        return ResponseEntity.ok(cartService.addToCart(userId.toString(), productId, quantity));
    }

    /**
     * Remove a product from the cart.
     *
     * @param productId the product ID to remove
     * @param authentication the current authentication
     * @return the updated cart response
     */
    @DeleteMapping("/remove/{productId}")
    @Operation(summary = "Remove item from cart", description = "Remove a specific product from the cart")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Item removed successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<CartResponse> removeFromCart(
            @PathVariable UUID productId,
            Authentication authentication) {
        UUID userId = userService.getCurrentUserId(authentication);
        return ResponseEntity.ok(cartService.removeFromCart(userId.toString(), productId));
    }

    @PutMapping("/items/{productId}")
    @Operation(summary = "Update item quantity", description = "Update quantity for a product in the current cart")
    @ApiResponses({
        @ApiResponse(responseCode = APIConstants.OK, description = "Item quantity updated successfully"),
        @ApiResponse(responseCode = APIConstants.UNAUTHORIZED, description = APIConstants.MSG_UNAUTHORIZED)
    })
    public ResponseEntity<CartResponse> updateQuantity(
            @PathVariable UUID productId,
            @RequestParam Integer quantity,
            Authentication authentication) {
        UUID userId = userService.getCurrentUserId(authentication);
        return ResponseEntity.ok(cartService.updateQuantity(userId.toString(), productId, quantity));
    }

    /**
     * Clear the entire cart.
     *
     * @param authentication the current authentication
     * @return 204 No Content
     */
    @DeleteMapping("/clear")
    @Operation(summary = "Clear cart", description = "Remove all items from the current user's cart")
    @ApiResponses({
        @ApiResponse(responseCode = APIConstants.NO_CONTENT, description = "Cart cleared successfully"),
        @ApiResponse(responseCode = APIConstants.UNAUTHORIZED, description = APIConstants.MSG_UNAUTHORIZED)
    })
    public ResponseEntity<Void> clearCart(Authentication authentication) {
        UUID userId = userService.getCurrentUserId(authentication);
        cartService.clearCart(userId.toString());
        return ResponseEntity.noContent().build();
    }
}
