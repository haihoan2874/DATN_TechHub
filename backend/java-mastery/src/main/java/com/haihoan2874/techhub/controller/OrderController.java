package com.haihoan2874.techhub.controller;

import com.haihoan2874.techhub.constant.APIConstants;
import com.haihoan2874.techhub.dto.request.CheckoutRequest;
import com.haihoan2874.techhub.dto.request.CreateOrderRequest;
import com.haihoan2874.techhub.dto.response.CheckoutResponse;
import com.haihoan2874.techhub.dto.response.CreateOrderResponse;
import com.haihoan2874.techhub.dto.response.GetOrderByOrderNumberResponse;
import com.haihoan2874.techhub.dto.response.GetOrderByIdResponse;
import com.haihoan2874.techhub.dto.response.PatchCancelOrderResponse;
import com.haihoan2874.techhub.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/orders")
@Tag(name = "Orders", description = "Order management endpoints")
public class OrderController {
    private final OrderService orderService;

    @SecurityRequirement(name = APIConstants.BEARER)
    @PostMapping("/checkout")
    @Operation(summary = "Checkout from cart", description = "Create order from current user cart items in Redis")
    public ResponseEntity<CheckoutResponse> checkout(
            @RequestBody CheckoutRequest request,
            HttpServletRequest servletRequest,
            Authentication authentication) {
        log.info("Request checkout for user: {}", authentication.getName());
        return ResponseEntity.ok(orderService.checkout(request, servletRequest, authentication));
    }

    @PostMapping
    @Operation(summary = "Create order", description = "Create a new order")
    @SecurityRequirement(name = APIConstants.BEARER)
    @ApiResponses({
            @ApiResponse(responseCode = APIConstants.CREATED, description = "Order created successfully",
                    content = @Content(schema = @Schema(implementation = CreateOrderResponse.class))),
            @ApiResponse(responseCode = APIConstants.BAD_REQUEST, description = "Invalid input or insufficient stock"),
            @ApiResponse(responseCode = APIConstants.UNAUTHORIZED, description = APIConstants.MSG_UNAUTHORIZED),
            @ApiResponse(responseCode = APIConstants.NOT_FOUND, description = "Product or address not found")
    })
    public ResponseEntity<CreateOrderResponse> createOrder(@Valid @RequestBody CreateOrderRequest request, Authentication authentication) {
        log.info("Creating order for user");

        CreateOrderResponse response = orderService.createOrder(request, authentication);

        log.info("Order created with id: {}", response.getId());

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get order by id", description = "Get an order by its ID")
    @ApiResponses({
            @ApiResponse(responseCode = APIConstants.OK, description = "Order retrieved successfully",
                    content = @Content(schema = @Schema(implementation = GetOrderByIdResponse.class))),
            @ApiResponse(responseCode = APIConstants.UNAUTHORIZED, description = APIConstants.MSG_UNAUTHORIZED),
            @ApiResponse(responseCode = APIConstants.NOT_FOUND, description = APIConstants.MSG_ORDER_NOT_FOUND)
    })
    public ResponseEntity<GetOrderByIdResponse> getOrderById(@PathVariable UUID id, Authentication authentication) {
        return ResponseEntity.ok(orderService.getDetailOrderById(id, authentication));
    }

    @GetMapping("/number/{orderNumber}")
    @Operation(summary = "Get order by order number", description = "Get order detail by order number")
    @SecurityRequirement(name = APIConstants.BEARER)
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Order retrieved successfully",
                    content = @Content(schema = @Schema(implementation = GetOrderByOrderNumberResponse.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "404", description = "Order not found")
    })
    public ResponseEntity<GetOrderByOrderNumberResponse> getDetailByOrderNumber(@PathVariable String orderNumber, Authentication authentication) {
        return ResponseEntity.ok(orderService.getDetailByOrderNumber(orderNumber, authentication));
    }

    @PatchMapping("/{id}/cancel")
    @Operation(summary = "Cancel order")
    @SecurityRequirement(name = APIConstants.BEARER)
    @ApiResponses({
            @ApiResponse(responseCode = APIConstants.OK, description = "Cancel order successfully",
                    content = @Content(schema = @Schema(implementation = PatchCancelOrderResponse.class))),
            @ApiResponse(responseCode = APIConstants.UNAUTHORIZED, description = APIConstants.MSG_UNAUTHORIZED),
            @ApiResponse(responseCode = APIConstants.NOT_FOUND, description = APIConstants.MSG_ORDER_NOT_FOUND)
    })
    public ResponseEntity<PatchCancelOrderResponse> cancelOrder(@PathVariable UUID id, Authentication authentication) {
        PatchCancelOrderResponse response = orderService.cancelOrder(id, authentication);

        return ResponseEntity.ok(response);
    }

}
