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
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class CartService {

    private final RedisTemplate<String, Object> redisTemplate;
    private final ProductService productService;
    
    private static final String CART_PREFIX = "cart:";
    private static final long CART_TTL = 7; // days

    public CartResponse getCart(String userId) {
        String key = CART_PREFIX + userId;
        CartResponse cart = (CartResponse) redisTemplate.opsForValue().get(key);
        
        if (cart == null) {
            cart = CartResponse.builder()
                    .userId(userId)
                    .items(new ArrayList<>())
                    .totalPrice(BigDecimal.ZERO)
                    .totalItems(0)
                    .build();
        }
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

    public void clearCart(String userId) {
        redisTemplate.delete(CART_PREFIX + userId);
    }

    private void saveCart(CartResponse cart) {
        String key = CART_PREFIX + cart.getUserId();
        redisTemplate.opsForValue().set(key, cart, CART_TTL, TimeUnit.DAYS);
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
        if (product.getStockQuantity() == null || product.getStockQuantity() <= 0) {
            throw new IllegalStateException("Sản phẩm đã hết hàng");
        }
        if (quantity > product.getStockQuantity()) {
            throw new IllegalStateException("Sản phẩm hiện tại không đủ số lượng theo yêu cầu");
        }
    }
}
