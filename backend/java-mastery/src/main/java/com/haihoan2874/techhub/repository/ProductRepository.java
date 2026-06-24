package com.haihoan2874.techhub.repository;

import com.haihoan2874.techhub.dto.response.ProductResponse;
import com.haihoan2874.techhub.dto.request.ProductFilter;
import com.haihoan2874.techhub.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductRepository extends JpaRepository<Product, UUID> {
    boolean existsByCategoryId(UUID categoryId);

    boolean existsByBrandId(UUID brandId);

    boolean existsByName(String name);

    @Query(value = """
            SELECT new com.haihoan2874.techhub.dto.response.ProductResponse(
                p.id,
                p.categoryId,
                p.brandId,
                c.name,
                b.name,
                p.name,
                p.slug,
                p.description,
                p.price,
                p.imageUrl,
                COALESCE(i.quantityAvailable, 0),
                p.isActive,
                p.specs,
                p.features,
                p.videoUrls,
                p.createdAt,
                p.createdBy,
                p.updatedAt,
                p.updatedBy,
                COALESCE(AVG(r.rating), 5.0),
                CAST(COUNT(r.id) AS integer)
            )
            FROM Product p
            JOIN Category c ON p.categoryId = c.id
            LEFT JOIN Brand b ON p.brandId = b.id
            LEFT JOIN Inventory i ON i.productId = p.id
            LEFT JOIN Review r ON r.product.id = p.id
            WHERE (:#{#filter.categoryId} IS NULL OR p.categoryId = :#{#filter.categoryId})
            AND (:#{#filter.brandId} IS NULL OR p.brandId = :#{#filter.brandId})
            AND (:#{#filter.name} IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :#{#filter.name},'%')))
            AND (:#{#filter.minPrice} IS NULL OR p.price >= :#{#filter.minPrice})
            AND (:#{#filter.maxPrice} IS NULL OR p.price <= :#{#filter.maxPrice})
            AND (:#{#filter.isActive} IS NULL OR p.isActive = :#{#filter.isActive})
            GROUP BY p, c, b, i
            """,
            countQuery = """
                    SELECT COUNT(p)
                    FROM Product p
                    WHERE (:#{#filter.categoryId} IS NULL OR p.categoryId = :#{#filter.categoryId})
                    AND (:#{#filter.brandId} IS NULL OR p.brandId = :#{#filter.brandId})
                    AND (:#{#filter.name} IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :#{#filter.name},'%')))
                    AND (:#{#filter.minPrice} IS NULL OR p.price >= :#{#filter.minPrice})
                    AND (:#{#filter.maxPrice} IS NULL OR p.price <= :#{#filter.maxPrice})
                    AND (:#{#filter.isActive} IS NULL OR p.isActive = :#{#filter.isActive})
                    """)
    Page<ProductResponse> findProductsByFilter(@Param("filter") ProductFilter filter, Pageable pageable);

    boolean existsByNameAndIdNot(String name, UUID id);

    boolean existsBySlug(String slug);


    @Query("""
            SELECT new com.haihoan2874.techhub.dto.response.ProductResponse(
                        p.id,
                        p.categoryId,
                        p.brandId,
                        c.name,
                        b.name,
                        p.name,
                        p.slug,
                        p.description,
                        p.price,
                        p.imageUrl,
                        COALESCE(i.quantityAvailable, 0),
                        p.isActive,
                        p.specs,
                        p.features,
                        p.videoUrls,
                        p.createdAt,
                        p.createdBy,
                        p.updatedAt,
                        p.updatedBy,
                        COALESCE(AVG(r.rating), 5.0),
                        CAST(COUNT(r.id) AS integer)
                        )
                        FROM Product p
                        JOIN Category c ON p.categoryId=c.id
                        LEFT JOIN Brand b ON p.brandId=b.id
                        LEFT JOIN Inventory i ON i.productId = p.id
                        LEFT JOIN Review r ON r.product.id = p.id
                        WHERE (:columnName = 'id' AND CAST(p.id AS string ) = :value )
                        OR (:columnName = 'slug' AND p.slug = :value)
                        GROUP BY p, c, b, i
            """)
    Optional<ProductResponse> findDetailProductByCondition(@Param("columnName") String columnName, @Param("value") String value);

    @Query("""
            SELECT p
            FROM Product p
            Where p.id IN :ids
            """)
    List<Product> findProductsByIds(@Param("ids") List<UUID> id);

    @Query(value = """
            SELECT p.name, p.image_url,
                   COALESCE(i.quantity_available, 0) AS stock_quantity
            FROM products p
            LEFT JOIN inventory i ON i.product_id = p.id
            WHERE p.is_active = true
            ORDER BY COALESCE(i.quantity_available, 0) ASC, p.updated_at DESC
            LIMIT :limit
            """, nativeQuery = true)
    List<Object[]> findLowStockProducts(@Param("limit") int limit);

    @Query(value = """
            SELECT p.*
            FROM products p
            LEFT JOIN inventory i ON i.product_id = p.id
            WHERE p.is_active = true
              AND COALESCE(i.quantity_available, 0) > 0
              AND (
                    LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
                 OR LOWER(COALESCE(p.description, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                 OR LOWER(COALESCE(CAST(p.specs AS text), '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                 OR LOWER(COALESCE(CAST(p.features AS text), '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
              )
            ORDER BY p.updated_at DESC
            LIMIT :limit
            """, nativeQuery = true)
    List<Product> findActiveProductsForAiByKeyword(@Param("keyword") String keyword, @Param("limit") int limit);

    @Query(value = """
            SELECT p.*
            FROM products p
            LEFT JOIN inventory i ON i.product_id = p.id
            WHERE p.is_active = true
              AND COALESCE(i.quantity_available, 0) > 0
              AND (:minPrice IS NULL OR p.price >= :minPrice)
              AND (:maxPrice IS NULL OR p.price <= :maxPrice)
              AND (
                    :keyword IS NULL
                 OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
                 OR LOWER(COALESCE(p.description, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                 OR LOWER(COALESCE(CAST(p.specs AS text), '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                 OR LOWER(COALESCE(CAST(p.features AS text), '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
              )
            ORDER BY p.price DESC, p.updated_at DESC
            LIMIT :limit
            """, nativeQuery = true)
    List<Product> findActiveProductsForAiByBudget(
            @Param("keyword") String keyword,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("limit") int limit);

    @Query(value = """
            SELECT p.*
            FROM products p
            LEFT JOIN inventory i ON i.product_id = p.id
            WHERE p.is_active = true
              AND COALESCE(i.quantity_available, 0) > 0
            ORDER BY p.updated_at DESC
            LIMIT :limit
            """, nativeQuery = true)
    List<Product> findActiveProductsForAi(@Param("limit") int limit);
}
