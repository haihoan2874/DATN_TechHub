package com.haihoan2874.techhub.service;

import com.haihoan2874.techhub.dto.request.CreateOrderRequest;
import com.haihoan2874.techhub.dto.response.CreateOrderResponse;
import com.haihoan2874.techhub.dto.response.GetOrderByOrderNumberResponse;
import com.haihoan2874.techhub.model.CustomerAddress;
import com.haihoan2874.techhub.model.Order;
import com.haihoan2874.techhub.model.OrderStatus;
import com.haihoan2874.techhub.model.Product;
import com.haihoan2874.techhub.dto.response.GetOrderByIdResponse;
import com.haihoan2874.techhub.dto.response.PatchCancelOrderResponse;
import com.haihoan2874.techhub.model.*;
import com.haihoan2874.techhub.repository.CustomerAddressRepository;
import com.haihoan2874.techhub.repository.OrderItemRepository;
import com.haihoan2874.techhub.repository.OrderRepository;
import com.haihoan2874.techhub.repository.ProductRepository;
import com.haihoan2874.techhub.security.service.UserService;
import com.haihoan2874.techhub.dto.request.CheckoutRequest;
import com.haihoan2874.techhub.dto.response.CartResponse;
import com.haihoan2874.techhub.dto.response.CheckoutResponse;
import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderService {
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final CustomerAddressRepository customerAddressRepository;
    private final OrderItemRepository orderItemRepository;
    private final UserService userService;
    private final CartService cartService;
    private final InventoryService inventoryService;
    private final PaymentService paymentService;
    private final EmailService emailService;

    @Transactional
    public CreateOrderResponse createOrder(CreateOrderRequest request, Authentication authentication) {
        UUID userId = userService.getCurrentUserId(authentication);

        CustomerAddress address = customerAddressRepository.findByIdAndUserId(request.getShippingAddressId(), userId)
                .orElseThrow(() -> new EntityNotFoundException("Address not found"));

        List<UUID> productIds = request.getItems().stream()
                .map(CreateOrderRequest.ItemRequest::getProductId).toList();

        List<Product> products = productRepository.findProductsByIds(productIds);
        Map<UUID, Product> productMap = products.stream()
                .collect(Collectors.toMap(Product::getId, p -> p));

        Order order = Order.builder()
                .orderNumber(generateOrderNumber())
                .userId(userId)
                .status(OrderStatus.PENDING)
                .total(BigDecimal.ZERO)
                .shippingAddress(address)
                .paymentMethod(request.getPaymentMethod())
                .notes(request.getNotes())
                .items(new ArrayList<>())
                .build();

        Order savedOrder = orderRepository.saveAndFlush(order);

        List<OrderItem> savedItems = createOrderItems(request.getItems(), productMap, savedOrder);

        BigDecimal total = calculateTotal(savedItems);
        savedOrder.setTotal(total);
        orderRepository.save(savedOrder);

        productRepository.saveAll(products);

        return CreateOrderResponse.builder()
                .id(savedOrder.getId())
                .orderNumber(savedOrder.getOrderNumber())
                .userId(savedOrder.getUserId())
                .status(savedOrder.getStatus())
                .total(savedOrder.getTotal())
                .shippingAddress(String.format("%s || %s || %s", address.getFullName(), address.getPhone(), address.getAddress()))
                .paymentMethod(savedOrder.getPaymentMethod())
                .notes(savedOrder.getNotes())
                .items(savedItems.stream().map(item ->
                        CreateOrderResponse.ItemResponse.builder()
                                .id(item.getId())
                                .productId(item.getProductId())
                                .productName(item.getProductName())
                                .quantity(item.getQuantity())
                                .price(item.getPrice())
                                .subtotal(item.getSubtotal())
                                .build()).toList())
                .createdAt(savedOrder.getCreatedAt())
                .build();
    }

    @Transactional
    public GetOrderByIdResponse getDetailOrderById(UUID id, Authentication authentication) {
        UUID userId = userService.getCurrentUserId(authentication);
        log.info("Getting order by id {} for user id {} ", id, userId);

        Order order = orderRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new EntityNotFoundException("Order not found"));

        CustomerAddress address = customerAddressRepository.findByIdAndUserId(order.getShippingAddress().getId(), userId)
                .orElseThrow(() -> new EntityNotFoundException("Address not found"));

        return GetOrderByIdResponse.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .userId(order.getUserId())
                .status(order.getStatus())
                .total(order.getTotal())
                .shippingAddress(String.format("%s || %s || %s", address.getFullName(), address.getPhone(), address.getAddress()))
                .paymentMethod(order.getPaymentMethod())
                .notes(order.getNotes())
                .items(order.getItems().stream().map(item ->
                        GetOrderByIdResponse.ItemResponse.builder()
                                .id(item.getId())
                                .productId(item.getProductId())
                                .productName(item.getProductName())
                                .quantity(item.getQuantity())
                                .price(item.getPrice())
                                .subtotal(item.getSubtotal())
                                .build()).toList())
                .createdAt(order.getCreatedAt())
                .build();
    }

    @Transactional
    public GetOrderByOrderNumberResponse getDetailByOrderNumber(String orderNumber, Authentication authentication) {
        UUID userId = userService.getCurrentUserId(authentication);

        log.info("Getting order by orderNumber {} for user id {}", orderNumber, authentication);

        Order order = orderRepository.findByOrderNumberAndUserId(orderNumber, userId)
                .orElseThrow(() -> new EntityNotFoundException("Order not found"));

        CustomerAddress address = customerAddressRepository.findByIdAndUserId(order.getShippingAddress().getId(), userId)
                .orElseThrow(() -> new EntityNotFoundException("Address not found"));

        return GetOrderByOrderNumberResponse.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .userId(order.getUserId())
                .status(order.getStatus())
                .total(order.getTotal())
                .shippingAddress(String.format("%s || %s || %s", address.getFullName(), address.getPhone(), address.getAddress()))
                .paymentMethod(order.getPaymentMethod())
                .notes(order.getNotes())
                .items(order.getItems().stream().map(item ->
                        GetOrderByOrderNumberResponse.ItemResponse.builder()
                                .id(item.getId())
                                .productId(item.getProductId())
                                .productName(item.getProductName())
                                .quantity(item.getQuantity())
                                .price(item.getPrice())
                                .subtotal(item.getSubtotal()).build()).toList())
                .createdAt(order.getCreatedAt())
                .build();
    }

    public PatchCancelOrderResponse cancelOrder(UUID id, Authentication authentication) {
        UUID userId = userService.getCurrentUserId(authentication);

        log.info("Canceling order with id {} for userId {}", id, userId);

        Order order = orderRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new EntityNotFoundException("Order not found"));

        if (order.getStatus() != OrderStatus.PENDING && order.getStatus() != OrderStatus.CONFIRMED) {
            throw new IllegalStateException("Cannot cancel order with status " + order.getStatus());
        }

        order.setStatus(OrderStatus.CANCELLED);

        Order savedOrder = orderRepository.save(order);

        return PatchCancelOrderResponse.builder()
                .id(savedOrder.getId())
                .orderNumber(order.getOrderNumber())
                .status(savedOrder.getStatus())
                .updatedAt(savedOrder.getUpdatedAt())
                .build();
    }

    @Transactional
    public CheckoutResponse checkout(CheckoutRequest request, HttpServletRequest servletRequest, Authentication authentication) {
        UUID userId = userService.getCurrentUserId(authentication);
        log.info("Starting checkout for user: {}", userId);

        // 1. Get Cart from Redis
        CartResponse cart = cartService.getCart(userId.toString());
        if (cart == null || cart.getItems().isEmpty()) {
            throw new IllegalStateException("Cart is empty");
        }

        // 2. Validate Address
        CustomerAddress address = customerAddressRepository.findByIdAndUserId(request.getShippingAddressId(), userId)
                .orElseThrow(() -> new EntityNotFoundException("Shipping address not found"));

        // 3. Create Order
        Order order = Order.builder()
                .orderNumber(generateOrderNumber())
                .userId(userId)
                .status(OrderStatus.PENDING)
                .total(cart.getTotalPrice())
                .shippingAddress(address)
                .paymentMethod(request.getPaymentMethod())
                .notes(request.getNotes())
                .items(new ArrayList<>())
                .build();

        Order savedOrder = orderRepository.saveAndFlush(order);

        // 4. Reserve Stock & Create Order Items
        List<OrderItem> orderItems = new ArrayList<>();
        for (var cartItem : cart.getItems()) {
            // Atomic reserve in DB
            boolean reserved = inventoryService.reserveStock(cartItem.getProductId(), cartItem.getQuantity());
            if (!reserved) {
                throw new RuntimeException("Product " + cartItem.getProductName() + " is out of stock");
            }

            OrderItem orderItem = OrderItem.builder()
                    .order(savedOrder)
                    .productId(cartItem.getProductId())
                    .productName(cartItem.getProductName())
                    .quantity(cartItem.getQuantity())
                    .price(cartItem.getPrice())
                    .subtotal(cartItem.getSubTotal())
                    .build();
            orderItems.add(orderItem);
        }
        orderItemRepository.saveAll(orderItems);
        savedOrder.setItems(orderItems);

        // 5. Generate Payment URL if VNPay
        String paymentUrl = null;
        if ("VNPAY".equalsIgnoreCase(request.getPaymentMethod())) {
            paymentUrl = paymentService.createPaymentUrl(
                    servletRequest, 
                    savedOrder.getTotal().longValue(), 
                    "Thanh toan don hang " + savedOrder.getOrderNumber(), 
                    savedOrder.getOrderNumber()
            );
        }

        // 6. Clear Cart
        cartService.clearCart(userId.toString());

        // 7. Send Email confirmation (Async)
        emailService.sendEmail(
                userService.getUserByUsername(authentication.getName()).getEmail(),
                "TechHub - Xác nhận đặt hàng " + savedOrder.getOrderNumber(),
                "Cảm ơn bạn đã đặt hàng tại TechHub. Mã đơn hàng của bạn là: " + savedOrder.getOrderNumber(),
                false
        );

        log.info("Checkout successful for order: {}", savedOrder.getOrderNumber());

        return CheckoutResponse.builder()
                .orderId(savedOrder.getId())
                .orderNumber(savedOrder.getOrderNumber())
                .status(savedOrder.getStatus().toString())
                .totalAmount(savedOrder.getTotal())
                .paymentUrl(paymentUrl)
                .message("Order created successfully")
                .build();
    }

    @Transactional
    public void processPaymentSuccess(String orderNumber) {
        log.info("Processing successful payment for order: {}", orderNumber);
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new EntityNotFoundException("Order not found: " + orderNumber));

        if (order.getStatus() != OrderStatus.PENDING) {
            log.warn("Order {} is already in status {}", orderNumber, order.getStatus());
            return;
        }

        // 1. Update Order Status
        order.setStatus(OrderStatus.CONFIRMED);
        orderRepository.save(order);

        // 2. Confirm Inventory Sale (Release Reserved -> Actually deduct)
        for (OrderItem item : order.getItems()) {
            inventoryService.confirmSale(item.getProductId(), item.getQuantity());
        }

        log.info("Order {} confirmed and inventory updated", orderNumber);
    }

    private List<OrderItem> createOrderItems(List<CreateOrderRequest.ItemRequest> itemRequests,
                                             Map<UUID, Product> productMap,
                                             Order order) {
        List<OrderItem> orderItems = new ArrayList<>();

        for (CreateOrderRequest.ItemRequest itemReq : itemRequests) {
            Product product = productMap.get(itemReq.getProductId());

            if (product == null) {
                throw new EntityNotFoundException("Product not found");
            }

            if (product.getStockQuantity() < itemReq.getQuantity()) {
                throw new RuntimeException("Product " + product.getName() + " is out of stock");
            }

            product.setStockQuantity(product.getStockQuantity() - itemReq.getQuantity());

            BigDecimal subtotal = product.getPrice().multiply(BigDecimal.valueOf(itemReq.getQuantity()));

            OrderItem item = OrderItem.builder()
                    .order(order)
                    .productId(product.getId())
                    .productName(product.getName())
                    .quantity(itemReq.getQuantity())
                    .price(product.getPrice())
                    .subtotal(subtotal)
                    .build();

            orderItems.add(item);
        }
        return orderItemRepository.saveAll(orderItems);
    }

    private String generateOrderNumber() {
        LocalDateTime startOfDay = LocalDateTime.now().toLocalDate().atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1);

        Long todayOrderCount = orderRepository.countByCreatedAtBetween(startOfDay, endOfDay);
        String dateStr = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));

        return String.format("ORD-%s-%03d", dateStr, todayOrderCount + 1);
    }

    private BigDecimal calculateTotal(List<OrderItem> orderItems) {
        return orderItems.stream()
                .map(OrderItem::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

}
