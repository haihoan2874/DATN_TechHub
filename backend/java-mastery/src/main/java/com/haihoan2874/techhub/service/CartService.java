package com.haihoan2874.techhub.service;

import com.haihoan2874.techhub.dto.response.CartItemResponse;
import com.haihoan2874.techhub.dto.response.CartResponse;
import com.haihoan2874.techhub.dto.response.ProductResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class CartService {

    private final RedisTemplate<String, Object> redisTemplate;
    private final ProductService productService;
    
    private static final String CART_PREFIX = "cart:";
    private static final long CART_TTL = 7; // days
    private final Map<String, CartResponse> fallbackCarts = new ConcurrentHashMap<>();

    public CartResponse getCart(String userId) {
        String key = CART_PREFIX + userId;
        Object cachedCart;
        try {
            cachedCart = redisTemplate.opsForValue().get(key);
        } catch (Exception ex) {
            log.warn("Cannot read cart cache for user {}. Using in-memory cart fallback.", userId, ex);
            return getFallbackCart(userId);
        }

        if (cachedCart == null) {
            return createEmptyCart(userId);
        }

        if (!(cachedCart instanceof CartResponse cart)) {
            log.warn("Unexpected cart cache type {} for user {}. Resetting cart cache.",
                    cachedCart.getClass().getName(), userId);
            deleteRedisCart(key);
            return createEmptyCart(userId);
        }

        normalizeCart(cart, userId);
        return cart;
    }

    public CartResponse addToCart(String userId, UUID productId, Integer quantity) {
        validateQuantity(quantity);
        CartResponse cart = getCart(userId);
        ProductResponse product = productService.getProductByCondition("id", productId.toString());
        
        Optional<CartItemResponse> existingItem = cart.getItems().stream()
                .filter(item -> item.getProductId().equals(productId))
                .findFirst();

        if (existingItem.isPresent()) {
            CartItemResponse item = existingItem.get();
            int newQuantity = item.getQuantity() + quantity;
            validateStock(product, newQuantity);
            item.setQuantity(newQuantity);
            item.setSubTotal(item.getPrice().multiply(BigDecimal.valueOf(newQuantity)));
        } else {
            validateStock(product, quantity);
            
            CartItemResponse newItem = CartItemResponse.builder()
                    .productId(product.getId())
                    .productName(product.getName())
                    .slug(product.getSlug())
                    .imageUrl(product.getImageUrl())
                    .price(product.getPrice())
                    .quantity(quantity)
                    .subTotal(product.getPrice().multiply(BigDecimal.valueOf(quantity)))
                    .build();
            cart.getItems().add(newItem);
        }

        cart.calculateTotal();
        saveCart(cart);
        return cart;
    }

    public CartResponse updateQuantity(String userId, UUID productId, Integer quantity) {
        validateQuantity(quantity);
        CartResponse cart = getCart(userId);
        ProductResponse product = productService.getProductByCondition("id", productId.toString());
        validateStock(product, quantity);

        CartItemResponse item = cart.getItems().stream()
                .filter(cartItem -> cartItem.getProductId().equals(productId))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("Sản phẩm không tồn tại trong giỏ hàng"));

        item.setQuantity(quantity);
        item.setSubTotal(item.getPrice().multiply(BigDecimal.valueOf(quantity)));
        cart.calculateTotal();
        saveCart(cart);
        return cart;
    }

    public CartResponse removeFromCart(String userId, UUID productId) {
        CartResponse cart = getCart(userId);
        cart.getItems().removeIf(item -> item.getProductId().equals(productId));
        cart.calculateTotal();
        saveCart(cart);
        return cart;
    }

    public CartResponse removeItemsFromCart(String userId, List<UUID> productIds) {
        if (productIds == null || productIds.isEmpty()) {
            return getCart(userId);
        }

        CartResponse cart = getCart(userId);
        cart.getItems().removeIf(item -> productIds.contains(item.getProductId()));
        cart.calculateTotal();
        saveCart(cart);
        return cart;
    }

    public void clearCart(String userId) {
        fallbackCarts.remove(userId);
        deleteRedisCart(CART_PREFIX + userId);
    }

    private void saveCart(CartResponse cart) {
        String key = CART_PREFIX + cart.getUserId();
        try {
            redisTemplate.opsForValue().set(key, cart, CART_TTL, TimeUnit.DAYS);
        } catch (Exception ex) {
            log.warn("Cannot save cart cache for user {}. Saving to in-memory fallback.", cart.getUserId(), ex);
            fallbackCarts.put(cart.getUserId(), cart);
        }
    }

    private CartResponse createEmptyCart(String userId) {
        return CartResponse.builder()
                .userId(userId)
                .items(new ArrayList<>())
                .totalPrice(BigDecimal.ZERO)
                .totalItems(0)
                .build();
    }

    private void normalizeCart(CartResponse cart, String userId) {
        if (cart.getUserId() == null) {
            cart.setUserId(userId);
        }
        if (cart.getItems() == null) {
            cart.setItems(new ArrayList<>());
        }
        if (cart.getTotalPrice() == null || cart.getTotalItems() == null) {
            cart.calculateTotal();
        }
    }

    private CartResponse getFallbackCart(String userId) {
        CartResponse cart = fallbackCarts.computeIfAbsent(userId, this::createEmptyCart);
        normalizeCart(cart, userId);
        return cart;
    }

    private void deleteRedisCart(String key) {
        try {
            redisTemplate.delete(key);
        } catch (Exception ex) {
            log.warn("Cannot delete Redis cart key {}. Ignoring because fallback cart is available.", key, ex);
        }
    }

    private void validateQuantity(Integer quantity) {
        if (quantity == null || quantity < 1) {
            throw new IllegalStateException("Số lượng sản phẩm phải lớn hơn 0");
        }
    }

    private void validateStock(ProductResponse product, Integer quantity) {
        if (Boolean.FALSE.equals(product.getIsActive())) {
            throw new IllegalStateException("Sản phẩm hiện không còn kinh doanh");
        }
        // Dùng stockQuantity từ ProductResponse (đã được map từ inventory.quantity_available)
        if (product.getStockQuantity() == null || product.getStockQuantity() <= 0) {
            throw new IllegalStateException("Sản phẩm đã hết hàng");
        }
        if (quantity > product.getStockQuantity()) {
            throw new IllegalStateException("Sản phẩm hiện tại không đủ số lượng theo yêu cầu");
        }
    }
}
