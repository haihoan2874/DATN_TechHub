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
import com.haihoan2874.techhub.dto.response.AdminOrderResponse;
import com.haihoan2874.techhub.dto.response.OrderHistoryResponse;
import com.haihoan2874.techhub.model.*;
import com.haihoan2874.techhub.repository.CustomerAddressRepository;
import com.haihoan2874.techhub.repository.OrderItemRepository;
import com.haihoan2874.techhub.repository.OrderRepository;
import com.haihoan2874.techhub.repository.ProductRepository;
import com.haihoan2874.techhub.repository.UserRepository;
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
    private final UserRepository userRepository;
    private final CartService cartService;
    private final InventoryService inventoryService;
    private final PaymentService paymentService;
    private final EmailService emailService;
    private final VoucherService voucherService;

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

    @Transactional(readOnly = true)
    public List<OrderHistoryResponse> getMyOrders(Authentication authentication) {
        UUID userId = userService.getCurrentUserId(authentication);
        log.info("Fetching order history for user id {}", userId);

        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(order -> OrderHistoryResponse.builder()
                        .id(order.getId())
                        .orderNumber(order.getOrderNumber())
                        .status(order.getStatus())
                        .totalAmount(order.getTotal())
                        .paymentMethod(order.getPaymentMethod())
                        .createdAt(order.getCreatedAt())
                        .orderItems(order.getItems().stream()
                                .map(item -> OrderHistoryResponse.OrderItemResponse.builder()
                                        .productId(item.getProductId())
                                        .productName(item.getProductName())
                                        .quantity(item.getQuantity())
                                        .price(item.getPrice())
                                        .subtotal(item.getSubtotal())
                                        .build())
                                .toList())
                        .build())
                .toList();
    }

    @Transactional
    public PatchCancelOrderResponse cancelOrder(UUID id, Authentication authentication) {
        UUID userId = userService.getCurrentUserId(authentication);

        log.info("Canceling order with id {} for userId {}", id, userId);

        Order order = orderRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new EntityNotFoundException("Order not found"));

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new IllegalStateException("Cannot cancel order with status " + order.getStatus());
        }

        restoreCancelledOrderStock(order);
        order.setStatus(OrderStatus.CANCELLED);

        Order savedOrder = orderRepository.save(order);

        return PatchCancelOrderResponse.builder()
                .id(savedOrder.getId())
                .orderNumber(order.getOrderNumber())
                .status(savedOrder.getStatus())
                .updatedAt(savedOrder.getUpdatedAt())
                .build();
    }

    private void restoreCancelledOrderStock(Order order) {
        for (OrderItem item : order.getItems()) {
            Product product = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new EntityNotFoundException("Product not found"));

            int restoredStock = product.getStockQuantity() + item.getQuantity();
            product.setStockQuantity(restoredStock);
            productRepository.save(product);

            try {
                inventoryService.updateStock(product.getId(), restoredStock);
            } catch (EntityNotFoundException ex) {
                log.warn("Inventory not found while restoring stock for product {}", product.getId());
            }
        }
    }

    @Transactional(readOnly = true)
    public List<AdminOrderResponse> getAllOrdersAdmin() {
        log.info("Admin fetching all orders");
        List<Order> orders = orderRepository.findAllWithItems();
        return orders.stream().map(order -> {
            // Let's use a better way to get user info
            String customerName = "N/A";
            String customerEmail = "N/A";
            try {
                User u = userRepository.findById(order.getUserId()).orElse(null);
                if (u != null) {
                    customerName = u.getFirstName() + " " + u.getLastName();
                    customerEmail = u.getEmail();
                }
            } catch (Exception e) {
                log.error("Error fetching user for order: {}", order.getOrderNumber());
            }

            return AdminOrderResponse.builder()
                    .id(order.getId())
                    .orderNumber(order.getOrderNumber())
                    .status(order.getStatus())
                    .total(order.getTotal())
                    .customerName(customerName)
                    .customerEmail(customerEmail)
                    .itemCount(order.getItems().size())
                    .paymentMethod(order.getPaymentMethod())
                    .createdAt(order.getCreatedAt())
                    .build();
        }).collect(Collectors.toList());
    }

    @Transactional
    public AdminOrderResponse updateOrderStatus(UUID id, OrderStatus newStatus) {
        log.info("Admin updating order status for id {} to {}", id, newStatus);
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Order not found"));

        validateOrderStatusTransition(order.getStatus(), newStatus);

        order.setStatus(newStatus);
        Order savedOrder = orderRepository.save(order);
        
        return AdminOrderResponse.builder()
                .id(savedOrder.getId())
                .orderNumber(savedOrder.getOrderNumber())
                .status(savedOrder.getStatus())
                .total(savedOrder.getTotal())
                .build();
    }

    private void validateOrderStatusTransition(OrderStatus currentStatus, OrderStatus newStatus) {
        if (currentStatus == newStatus) {
            return;
        }

        boolean validTransition = switch (currentStatus) {
            case PENDING -> newStatus == OrderStatus.CONFIRMED
                    || newStatus == OrderStatus.PROCESSING
                    || newStatus == OrderStatus.CANCELLED;
            case CONFIRMED -> newStatus == OrderStatus.PROCESSING
                    || newStatus == OrderStatus.SHIPPED
                    || newStatus == OrderStatus.CANCELLED;
            case PROCESSING -> newStatus == OrderStatus.SHIPPED
                    || newStatus == OrderStatus.CANCELLED;
            case SHIPPED -> newStatus == OrderStatus.DELIVERED;
            case DELIVERED, CANCELLED -> false;
        };

        if (!validTransition) {
            throw new IllegalStateException("Cannot change order status from " + currentStatus + " to " + newStatus);
        }
    }

    @Transactional
    public CheckoutResponse checkout(CheckoutRequest request, HttpServletRequest servletRequest, Authentication authentication) {
        UUID userId = userService.getCurrentUserId(authentication);
        log.info("Starting checkout for user: {}", userId);

        CartResponse cart = validateCart(userId);
        CustomerAddress address = validateAddress(request.getShippingAddressId(), userId);
        
        BigDecimal discountAmount = calculateDiscount(request.getVoucherCode(), cart.getTotalPrice());
        
        BigDecimal finalTotal = cart.getTotalPrice().subtract(discountAmount);
        Order savedOrder = createInitialOrder(userId, finalTotal, discountAmount, address, request);

        List<OrderItem> orderItems = reserveInventoryAndCreateItems(savedOrder, cart.getItems());
        savedOrder.setItems(orderItems);
        voucherService.consumeVoucher(request.getVoucherCode(), cart.getTotalPrice());

        String paymentUrl = generatePaymentUrlIfVnPay(savedOrder, request.getPaymentMethod(), servletRequest);
        
        cartService.clearCart(userId.toString());
        sendOrderEmail(authentication.getName(), savedOrder);

        log.info("Checkout successful for order: {}", savedOrder.getOrderNumber());
        return mapToCheckoutResponse(savedOrder, paymentUrl);
    }

    private BigDecimal calculateDiscount(String voucherCode, BigDecimal orderAmount) {
        if (voucherCode == null || voucherCode.isBlank()) {
            return BigDecimal.ZERO;
        }
        return voucherService.applyVoucher(voucherCode, orderAmount).getDiscountAmount();
    }

    private CartResponse validateCart(UUID userId) {
        CartResponse cart = cartService.getCart(userId.toString());
        if (cart == null || cart.getItems().isEmpty()) {
            throw new IllegalStateException("Cart is empty");
        }
        return cart;
    }

    private CustomerAddress validateAddress(UUID addressId, UUID userId) {
        return customerAddressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> new EntityNotFoundException("Shipping address not found"));
    }

    private Order createInitialOrder(UUID userId, BigDecimal total, BigDecimal discountAmount, CustomerAddress address, CheckoutRequest request) {
        Order order = Order.builder()
                .orderNumber(generateOrderNumber())
                .userId(userId)
                .status(OrderStatus.PENDING)
                .total(total)
                .discountAmount(discountAmount)
                .voucherCode(request.getVoucherCode())
                .shippingAddress(address)
                .paymentMethod(request.getPaymentMethod())
                .notes(request.getNotes())
                .items(new ArrayList<>())
                .build();
        return orderRepository.saveAndFlush(order);
    }

    private List<OrderItem> reserveInventoryAndCreateItems(Order order, List<?> cartItems) {
        List<OrderItem> orderItems = new ArrayList<>();
        // Note: Using a generic list to avoid casting issues in this internal helper if needed, 
        // but here we know they are CartItemResponse.
        for (Object itemObj : cartItems) {
            com.haihoan2874.techhub.dto.response.CartItemResponse cartItem = (com.haihoan2874.techhub.dto.response.CartItemResponse) itemObj;
            if (!inventoryService.reserveStock(cartItem.getProductId(), cartItem.getQuantity())) {
                throw new RuntimeException("Product " + cartItem.getProductName() + " is out of stock");
            }

            orderItems.add(OrderItem.builder()
                    .order(order)
                    .productId(cartItem.getProductId())
                    .productName(cartItem.getProductName())
                    .quantity(cartItem.getQuantity())
                    .price(cartItem.getPrice())
                    .subtotal(cartItem.getSubTotal())
                    .build());
        }
        return orderItemRepository.saveAll(orderItems);
    }

    private String generatePaymentUrlIfVnPay(Order order, String paymentMethod, HttpServletRequest request) {
        if ("VNPAY".equalsIgnoreCase(paymentMethod)) {
            return paymentService.createPaymentUrl(
                    request,
                    order.getTotal().longValue(),
                    "Thanh toan don hang " + order.getOrderNumber(),
                    order.getOrderNumber()
            );
        }
        return null;
    }

    private void sendOrderEmail(String username, Order order) {
        emailService.sendEmail(
                userService.getUserByUsername(username).getEmail(),
                "S-Life - Xác nhận đặt hàng " + order.getOrderNumber(),
                "Cảm ơn bạn đã tin tưởng chọn S-Life. Đơn hàng của bạn đang được chuẩn bị để bắt đầu hành trình chăm sóc sức khỏe. Mã đơn hàng: " + order.getOrderNumber(),
                false
        );
    }

    private CheckoutResponse mapToCheckoutResponse(Order order, String paymentUrl) {
        return CheckoutResponse.builder()
                .orderId(order.getId())
                .orderNumber(order.getOrderNumber())
                .status(order.getStatus().toString())
                .totalAmount(order.getTotal())
                .discountAmount(order.getDiscountAmount())
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
