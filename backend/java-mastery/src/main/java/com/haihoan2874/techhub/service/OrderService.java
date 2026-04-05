package com.haihoan2874.techhub.service;

import com.haihoan2874.techhub.dto.CreateOrderRequest;
import com.haihoan2874.techhub.dto.CreateOrderResponse;
import com.haihoan2874.techhub.dto.GetOrderByOrderNumberResponse;
import com.haihoan2874.techhub.model.CustomerAddress;
import com.haihoan2874.techhub.model.Order;
import com.haihoan2874.techhub.model.OrderStatus;
import com.haihoan2874.techhub.model.Product;
import com.haihoan2874.techhub.dto.GetOrderByIdResponse;
import com.haihoan2874.techhub.dto.PatchCancelOrderResponse;
import com.haihoan2874.techhub.model.*;
import com.haihoan2874.techhub.repository.CustomerAddressRepository;
import com.haihoan2874.techhub.repository.OrderItemRepository;
import com.haihoan2874.techhub.repository.OrderRepository;
import com.haihoan2874.techhub.repository.ProductRepository;
import com.haihoan2874.techhub.security.service.UserService;
import jakarta.persistence.EntityNotFoundException;
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
