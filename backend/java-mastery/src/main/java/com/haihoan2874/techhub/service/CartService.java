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
        CartResponse cart = getCart(userId);
        
        // Check if product already exists in cart
        Optional<CartItemResponse> existingItem = cart.getItems().stream()
                .filter(item -> item.getProductId().equals(productId))
                .findFirst();

        if (existingItem.isPresent()) {
            existingItem.get().setQuantity(existingItem.get().getQuantity() + quantity);
            existingItem.get().setSubTotal(existingItem.get().getPrice().multiply(BigDecimal.valueOf(existingItem.get().getQuantity())));
        } else {
            // Get product info from ProductService (which returns ProductResponse)
            ProductResponse product = productService.getProductByCondition("id", productId.toString());
            
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
}
