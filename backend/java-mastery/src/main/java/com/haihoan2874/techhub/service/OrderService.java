package com.haihoan2874.techhub.service;

import com.haihoan2874.techhub.dto.request.CheckoutRequest;
import com.haihoan2874.techhub.dto.request.CreateOrderRequest;
import com.haihoan2874.techhub.dto.response.AdminOrderResponse;
import com.haihoan2874.techhub.dto.response.CartItemResponse;
import com.haihoan2874.techhub.dto.response.CartResponse;
import com.haihoan2874.techhub.dto.response.CheckoutResponse;
import com.haihoan2874.techhub.dto.response.CreateOrderResponse;
import com.haihoan2874.techhub.dto.response.GetOrderByIdResponse;
import com.haihoan2874.techhub.dto.response.GetOrderByOrderNumberResponse;
import com.haihoan2874.techhub.dto.response.OrderHistoryResponse;
import com.haihoan2874.techhub.dto.response.PatchCancelOrderResponse;
import com.haihoan2874.techhub.model.CustomerAddress;
import com.haihoan2874.techhub.model.Order;
import com.haihoan2874.techhub.model.OrderItem;
import com.haihoan2874.techhub.model.OrderStatus;
import com.haihoan2874.techhub.model.Product;
import com.haihoan2874.techhub.model.User;
import com.haihoan2874.techhub.repository.CustomerAddressRepository;
import com.haihoan2874.techhub.repository.OrderItemRepository;
import com.haihoan2874.techhub.repository.OrderRepository;
import com.haihoan2874.techhub.repository.ProductRepository;
import com.haihoan2874.techhub.repository.ReviewRepository;
import com.haihoan2874.techhub.repository.UserRepository;
import com.haihoan2874.techhub.security.service.UserService;
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
import java.util.Set;
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
    private final ReviewRepository reviewRepository;

    @org.springframework.beans.factory.annotation.Value("${app.frontend-url}")
    private String frontendUrl;

    @Transactional
    public CreateOrderResponse createOrder(CreateOrderRequest request, Authentication authentication) {
        UUID userId = userService.getCurrentUserId(authentication);

        CustomerAddress address = customerAddressRepository.findByIdAndUserId(request.getShippingAddressId(), userId)
                .orElseThrow(() -> new EntityNotFoundException("Address not found"));

        List<UUID> productIds = request.getItems().stream()
                .map(CreateOrderRequest.ItemRequest::getProductId)
                .toList();

        List<Product> products = productRepository.findProductsByIds(productIds);
        Map<UUID, Product> productMap = products.stream()
                .collect(Collectors.toMap(Product::getId, product -> product));

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
                .shippingAddress(formatAddress(address))
                .paymentMethod(savedOrder.getPaymentMethod())
                .notes(savedOrder.getNotes())
                .items(savedItems.stream()
                        .map(this::mapToCreateOrderItemResponse)
                        .toList())
                .createdAt(savedOrder.getCreatedAt())
                .build();
    }

    @Transactional(readOnly = true)
    public GetOrderByIdResponse getDetailOrderById(UUID id, Authentication authentication) {
        UUID userId = userService.getCurrentUserId(authentication);
        log.info("Getting order by id {} for user id {}", id, userId);

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
                .shippingAddress(formatAddress(address))
                .paymentMethod(order.getPaymentMethod())
                .notes(order.getNotes())
                .items(order.getItems().stream()
                        .map(this::mapToGetOrderByIdItemResponse)
                        .toList())
                .createdAt(order.getCreatedAt())
                .build();
    }

    @Transactional(readOnly = true)
    public GetOrderByOrderNumberResponse getDetailByOrderNumber(String orderNumber, Authentication authentication) {
        UUID userId = userService.getCurrentUserId(authentication);
        log.info("Getting order by orderNumber {} for user id {}", orderNumber, userId);

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
                .shippingAddress(formatAddress(address))
                .paymentMethod(order.getPaymentMethod())
                .notes(order.getNotes())
                .items(order.getItems().stream()
                        .map(this::mapToGetOrderByNumberItemResponse)
                        .toList())
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
                                        .isReviewed(reviewRepository.existsByProductIdAndUserId(item.getProductId(), userId))
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

    @Transactional(readOnly = true)
    public List<AdminOrderResponse> getAllOrdersAdmin() {
        log.info("Admin fetching all orders");
        List<Order> orders = orderRepository.findAllWithItems();

        Set<UUID> userIds = orders.stream()
                .map(Order::getUserId)
                .collect(Collectors.toSet());

        Map<UUID, User> userMap = userRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(User::getId, user -> user));

        return orders.stream()
                .map(order -> mapToAdminOrderResponse(order, userMap.get(order.getUserId())))
                .toList();
    }

    @Transactional
    public AdminOrderResponse updateOrderStatus(UUID id, OrderStatus newStatus) {
        log.info("Admin updating order status for id {} to {}", id, newStatus);
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Order not found"));

        OrderStatus currentStatus = order.getStatus();
        validateOrderStatusTransition(currentStatus, newStatus);

        if (newStatus == OrderStatus.CANCELLED && currentStatus != OrderStatus.CANCELLED) {
            restoreCancelledOrderStock(order);
        } else if (currentStatus == OrderStatus.PENDING && newStatus != OrderStatus.PENDING) {
            confirmReservedOrderStock(order);
        }

        order.setStatus(newStatus);
        Order savedOrder = orderRepository.save(order);

        User user = userRepository.findById(savedOrder.getUserId()).orElse(null);
        return mapToAdminOrderResponse(savedOrder, user);
    }

    @Transactional
    public CheckoutResponse checkout(CheckoutRequest request, HttpServletRequest servletRequest, Authentication authentication) {
        UUID userId = userService.getCurrentUserId(authentication);
        log.info("Starting checkout for user: {}", userId);

        CartResponse cart = validateCart(userId);
        List<CartItemResponse> checkoutItems = resolveCheckoutItems(cart, request.getSelectedProductIds());
        BigDecimal checkoutTotal = calculateCartItemsTotal(checkoutItems);
        CustomerAddress address = validateAddress(request.getShippingAddressId(), userId);
        BigDecimal discountAmount = calculateDiscount(request.getVoucherCode(), checkoutTotal);
        BigDecimal finalTotal = checkoutTotal.subtract(discountAmount);

        Order savedOrder = createInitialOrder(userId, finalTotal, discountAmount, address, request);
        List<OrderItem> orderItems = reserveInventoryAndCreateItems(savedOrder, checkoutItems);
        savedOrder.setItems(orderItems);

        voucherService.consumeVoucher(request.getVoucherCode(), checkoutTotal);
        String paymentUrl = generatePaymentUrlIfVnPay(savedOrder, request.getPaymentMethod(), servletRequest);

        cartService.removeItemsFromCart(userId.toString(), checkoutItems.stream()
                .map(CartItemResponse::getProductId)
                .toList());
        sendOrderEmail(authentication.getName(), savedOrder);

        log.info("Checkout successful for order: {}", savedOrder.getOrderNumber());
        return mapToCheckoutResponse(savedOrder, paymentUrl);
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

        order.setStatus(OrderStatus.PROCESSING);
        orderRepository.save(order);

        confirmReservedOrderStock(order);

        log.info("Order {} confirmed (now PROCESSING) and inventory updated", orderNumber);
    }

    @Transactional
    public void processPaymentFailed(String orderNumber) {
        log.info("Processing failed payment for order: {}", orderNumber);
        Order order = orderRepository.findByOrderNumber(orderNumber).orElse(null);
        if (order == null) {
            log.warn("Order not found on payment fail: {}", orderNumber);
            return;
        }

        if (order.getStatus() == OrderStatus.PENDING) {
            order.setStatus(OrderStatus.CANCELLED);
            orderRepository.save(order);
            restoreCancelledOrderStock(order);
            log.info("Order {} marked as CANCELLED due to failed payment and inventory restored", orderNumber);
        }
    }

    @Transactional
    public Map<String, String> processVnPayIpn(Map<String, String> queryParams) {
        try {
            if (!paymentService.verifySignature(queryParams)) {
                return vnPayIpnResponse("97", "Invalid signature");
            }

            String orderNumber = queryParams.get("vnp_TxnRef");
            Order order = orderRepository.findByOrderNumber(orderNumber).orElse(null);
            if (order == null) {
                return vnPayIpnResponse("01", "Order not found");
            }

            if (!isVnPayAmountMatched(order, queryParams.get("vnp_Amount"))) {
                return vnPayIpnResponse("04", "Invalid amount");
            }

            if (order.getStatus() != OrderStatus.PENDING) {
                return vnPayIpnResponse("02", "Order already confirmed");
            }

            boolean paymentSuccess = "00".equals(queryParams.get("vnp_ResponseCode"))
                    && "00".equals(queryParams.get("vnp_TransactionStatus"));
            if (paymentSuccess) {
                order.setStatus(OrderStatus.PROCESSING);
                orderRepository.save(order);
                confirmReservedOrderStock(order);
                log.info("VNPay IPN confirmed payment for order {}", orderNumber);
            } else {
                order.setStatus(OrderStatus.CANCELLED);
                orderRepository.save(order);
                restoreCancelledOrderStock(order);
                log.info("VNPay IPN marked failed payment as CANCELLED for order {}", orderNumber);
            }

            return vnPayIpnResponse("00", "Confirm Success");
        } catch (Exception ex) {
            log.error("Failed to process VNPay IPN", ex);
            return vnPayIpnResponse("99", "Unknown error");
        }
    }

    private boolean isVnPayAmountMatched(Order order, String rawVnPayAmount) {
        if (rawVnPayAmount == null || rawVnPayAmount.isBlank()) {
            return false;
        }
        try {
            BigDecimal expectedAmount = order.getTotal().multiply(BigDecimal.valueOf(100));
            BigDecimal actualAmount = new BigDecimal(rawVnPayAmount);
            return expectedAmount.compareTo(actualAmount) == 0;
        } catch (NumberFormatException ex) {
            return false;
        }
    }

    private Map<String, String> vnPayIpnResponse(String rspCode, String message) {
        return Map.of("RspCode", rspCode, "Message", message);
    }

    private void confirmReservedOrderStock(Order order) {
        for (OrderItem item : order.getItems()) {
            inventoryService.confirmSale(item.getProductId(), item.getQuantity());
        }
    }

    private List<OrderItem> reserveInventoryAndCreateItems(Order order, List<CartItemResponse> cartItems) {
        List<OrderItem> orderItems = new ArrayList<>();
        List<UUID> productIds = cartItems.stream()
                .map(CartItemResponse::getProductId)
                .toList();
        Map<UUID, Product> productMap = productRepository.findProductsByIds(productIds).stream()
                .collect(Collectors.toMap(Product::getId, product -> product));

        for (CartItemResponse cartItem : cartItems) {
            Product product = productMap.get(cartItem.getProductId());
            if (product == null) {
                throw new EntityNotFoundException("Product not found");
            }

            if (!inventoryService.reserveStock(cartItem.getProductId(), cartItem.getQuantity())) {
                throw new RuntimeException("Product " + cartItem.getProductName() + " is out of stock");
            }

            orderItems.add(OrderItem.builder()
                    .order(order)
                    .productId(product.getId())
                    .productName(product.getName())
                    .quantity(cartItem.getQuantity())
                    .price(cartItem.getPrice())
                    .costPrice(product.getCostPrice())
                    .subtotal(cartItem.getSubTotal())
                    .build());
        }

        return orderItemRepository.saveAll(orderItems);
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

            // Kiểm tra tồn kho qua bảng inventory (nguồn dữ liệu chính xác)
            int availableStock = inventoryService.getAvailableStock(product.getId());
            if (availableStock < itemReq.getQuantity()) {
                throw new RuntimeException("Product " + product.getName() + " is out of stock");
            }

            BigDecimal subtotal = product.getPrice().multiply(BigDecimal.valueOf(itemReq.getQuantity()));

            orderItems.add(OrderItem.builder()
                    .order(order)
                    .productId(product.getId())
                    .productName(product.getName())
                    .quantity(itemReq.getQuantity())
                    .price(product.getPrice())
                    .costPrice(product.getCostPrice())   // Snapshot giá vốn tại thời điểm mua
                    .subtotal(subtotal)
                    .build());
        }

        return orderItemRepository.saveAll(orderItems);
    }

    private Order createInitialOrder(UUID userId, BigDecimal total, BigDecimal discountAmount,
                                     CustomerAddress address, CheckoutRequest request) {
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

    private CartResponse validateCart(UUID userId) {
        CartResponse cart = cartService.getCart(userId.toString());
        if (cart == null || cart.getItems().isEmpty()) {
            throw new IllegalStateException("Cart is empty");
        }
        return cart;
    }

    private List<CartItemResponse> resolveCheckoutItems(CartResponse cart, List<UUID> selectedProductIds) {
        if (selectedProductIds == null || selectedProductIds.isEmpty()) {
            return cart.getItems();
        }

        Set<UUID> selectedIdSet = Set.copyOf(selectedProductIds);
        List<CartItemResponse> checkoutItems = cart.getItems().stream()
                .filter(item -> selectedIdSet.contains(item.getProductId()))
                .toList();

        if (checkoutItems.isEmpty()) {
            throw new IllegalStateException("No cart items selected for checkout");
        }

        return checkoutItems;
    }

    private BigDecimal calculateCartItemsTotal(List<CartItemResponse> cartItems) {
        return cartItems.stream()
                .map(item -> item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private CustomerAddress validateAddress(UUID addressId, UUID userId) {
        return customerAddressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> new EntityNotFoundException("Shipping address not found"));
    }

    private BigDecimal calculateDiscount(String voucherCode, BigDecimal orderAmount) {
        if (voucherCode == null || voucherCode.isBlank()) {
            return BigDecimal.ZERO;
        }
        return voucherService.applyVoucher(voucherCode, orderAmount).getDiscountAmount();
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
        String htmlContent = "<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;\">"
                + "<div style=\"background-color: #0f172a; padding: 20px; text-align: center;\">"
                + "<h1 style=\"color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;\">S-LIFE</h1>"
                + "<p style=\"color: #94a3b8; margin: 5px 0 0 0; font-size: 14px;\">Techwear & Smart Healthcare</p>"
                + "</div>"
                + "<div style=\"padding: 30px; background-color: #ffffff;\">"
                + "<h2 style=\"color: #0f172a; margin-top: 0; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px;\">Xác nhận đơn hàng</h2>"
                + "<p style=\"color: #334155; line-height: 1.6;\">Xin chào <strong>" + username + "</strong>,</p>"
                + "<p style=\"color: #334155; line-height: 1.6;\">Cảm ơn bạn đã tin tưởng chọn S-Life. Đơn hàng của bạn đã được hệ thống ghi nhận thành công và đang được chuẩn bị.</p>"
                + "<div style=\"background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #e2e8f0;\">"
                + "<h3 style=\"margin-top: 0; color: #0f172a; font-size: 16px;\">Thông tin thanh toán</h3>"
                + "<table style=\"width: 100%; border-collapse: collapse;\">"
                + "<tr><td style=\"padding: 8px 0; color: #64748b;\">Mã đơn hàng:</td><td style=\"padding: 8px 0; text-align: right; font-weight: bold; color: #0f172a;\">#" + order.getOrderNumber() + "</td></tr>"
                + "<tr><td style=\"padding: 8px 0; color: #64748b;\">Phương thức:</td><td style=\"padding: 8px 0; text-align: right; font-weight: bold; color: #0f172a;\">" + order.getPaymentMethod() + "</td></tr>"
                + "<tr><td style=\"padding: 8px 0; color: #64748b; border-top: 1px dashed #cbd5e1;\">Tổng cộng:</td><td style=\"padding: 8px 0; text-align: right; font-weight: bold; color: #2563eb; font-size: 18px; border-top: 1px dashed #cbd5e1;\">" + String.format("%,.0f", order.getTotal()) + " đ</td></tr>"
                + "</table>"
                + "</div>"
                + "<p style=\"color: #334155; line-height: 1.6;\">Chúng tôi sẽ thông báo cho bạn ngay khi đơn hàng được giao cho đơn vị vận chuyển.</p>"
                + "<div style=\"text-align: center; margin-top: 30px;\">"
                + "<a href=\"" + frontendUrl + "/orders\" style=\"display: inline-block; background-color: #0f172a; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: bold; font-size: 16px;\">Kiểm tra đơn hàng</a>"
                + "</div>"
                + "</div>"
                + "<div style=\"background-color: #f8fafc; padding: 20px; text-align: center; color: #64748b; font-size: 13px; border-top: 1px solid #e2e8f0;\">"
                + "<p style=\"margin: 0 0 5px 0;\">Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ bộ phận CSKH.</p>"
                + "<p style=\"margin: 0;\">&copy; 2026 S-Life TechHub. Đồ Án Tốt Nghiệp.</p>"
                + "</div>"
                + "</div>";

        emailService.sendEmail(
                userService.getUserByUsername(username).getEmail(),
                "S-Life - Xác nhận đặt hàng #" + order.getOrderNumber(),
                htmlContent,
                true
        );
    }

    private void restoreCancelledOrderStock(Order order) {
        for (OrderItem item : order.getItems()) {
            try {
                inventoryService.releaseStock(item.getProductId(), item.getQuantity());
            } catch (EntityNotFoundException ex) {
                log.warn("Inventory not found while restoring stock for product {}", item.getProductId());
            }
        }
    }

    private void validateOrderStatusTransition(OrderStatus currentStatus, OrderStatus newStatus) {
        if (currentStatus == newStatus) {
            return;
        }

        boolean validTransition = switch (currentStatus) {
            case PENDING -> newStatus == OrderStatus.PROCESSING
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

    private String formatAddress(CustomerAddress address) {
        return String.format("%s || %s || %s", address.getFullName(), address.getPhone(), address.getAddress());
    }

    private AdminOrderResponse mapToAdminOrderResponse(Order order, User user) {
        String customerName = "N/A";
        String customerEmail = "N/A";
        String customerPhone = "N/A";
        String shippingAddress = "N/A";

        if (order.getShippingAddress() != null) {
            customerName = order.getShippingAddress().getFullName();
            customerPhone = order.getShippingAddress().getPhone();
            shippingAddress = order.getShippingAddress().getAddress() != null ? order.getShippingAddress().getAddress() : formatAddress(order.getShippingAddress());
        }

        if (user != null) {
            if ("N/A".equals(customerName) || customerName.isBlank()) {
                customerName = String.format("%s %s", nullToEmpty(user.getFirstName()), nullToEmpty(user.getLastName())).trim();
                if (customerName.isBlank()) customerName = user.getUsername();
            }
            customerEmail = user.getEmail();
            if ("N/A".equals(customerPhone) || customerPhone.isBlank()) {
                customerPhone = user.getPhoneNumber() != null ? user.getPhoneNumber() : "N/A";
            }
        }

        BigDecimal grossProfit = BigDecimal.ZERO;
        java.util.List<AdminOrderResponse.AdminOrderItemResponse> items = new java.util.ArrayList<>();

        if (order.getItems() != null) {
            for (com.haihoan2874.techhub.model.OrderItem item : order.getItems()) {
                BigDecimal costPrice = item.getCostPrice() != null ? item.getCostPrice() : BigDecimal.ZERO;
                BigDecimal profit = item.getPrice().subtract(costPrice).multiply(BigDecimal.valueOf(item.getQuantity()));
                grossProfit = grossProfit.add(profit);

                items.add(AdminOrderResponse.AdminOrderItemResponse.builder()
                        .productId(item.getProductId())
                        .productName(item.getProductName())
                        .quantity(item.getQuantity())
                        .price(item.getPrice())
                        .costPrice(costPrice)
                        .subtotal(item.getSubtotal())
                        .grossProfit(profit)
                        .build());
            }
        }

        return AdminOrderResponse.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .status(order.getStatus())
                .total(order.getTotal())
                .customerName(customerName)
                .customerEmail(customerEmail)
                .customerPhone(customerPhone)
                .shippingAddress(shippingAddress)
                .itemCount(order.getItems() == null ? 0 : order.getItems().size())
                .paymentMethod(order.getPaymentMethod())
                .grossProfit(grossProfit)
                .createdAt(order.getCreatedAt())
                .items(items)
                .build();
    }

    private String nullToEmpty(String value) {
        return value == null ? "" : value;
    }

    private CreateOrderResponse.ItemResponse mapToCreateOrderItemResponse(OrderItem item) {
        return CreateOrderResponse.ItemResponse.builder()
                .id(item.getId())
                .productId(item.getProductId())
                .productName(item.getProductName())
                .quantity(item.getQuantity())
                .price(item.getPrice())
                .subtotal(item.getSubtotal())
                .build();
    }

    private GetOrderByIdResponse.ItemResponse mapToGetOrderByIdItemResponse(OrderItem item) {
        return GetOrderByIdResponse.ItemResponse.builder()
                .id(item.getId())
                .productId(item.getProductId())
                .productName(item.getProductName())
                .quantity(item.getQuantity())
                .price(item.getPrice())
                .subtotal(item.getSubtotal())
                .build();
    }

    private GetOrderByOrderNumberResponse.ItemResponse mapToGetOrderByNumberItemResponse(OrderItem item) {
        return GetOrderByOrderNumberResponse.ItemResponse.builder()
                .id(item.getId())
                .productId(item.getProductId())
                .productName(item.getProductName())
                .quantity(item.getQuantity())
                .price(item.getPrice())
                .subtotal(item.getSubtotal())
                .build();
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
}
