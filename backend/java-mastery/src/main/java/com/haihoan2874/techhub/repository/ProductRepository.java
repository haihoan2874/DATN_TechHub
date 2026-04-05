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
                p.name,
                p.slug,
                p.description,
                p.price,
                p.imageUrl,
                p.stockQuantity,
                p.isActive,
                p.specs,
                p.videoUrls,
                p.createdAt,
                p.createdBy,
                p.updatedAt,
                p.updatedBy,
                CAST(0.0 AS double),
                CAST(0 AS integer)
            )
            FROM Product p
            JOIN Category c ON p.categoryId = c.id
            WHERE (:#{#filter.categoryId} IS NULL OR p.categoryId = :#{#filter.categoryId})
            AND (:#{#filter.name} IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :#{#filter.name},'%')))
            AND (:#{#filter.minPrice} IS NULL OR p.price >= :#{#filter.minPrice})
            AND (:#{#filter.maxPrice} IS NULL OR p.price <= :#{#filter.maxPrice})
            AND (:#{#filter.isActive} IS NULL OR p.isActive = :#{#filter.isActive})
            """,
            countQuery = """
                    SELECT COUNT(p)
                    FROM Product p
                    WHERE (:#{#filter.categoryId} IS NULL OR p.categoryId = :#{#filter.categoryId})
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
                        p.name,
                        p.slug,
                        p.description,
                        p.price,
                        p.imageUrl,
                        p.stockQuantity,
                        p.isActive,
                        p.specs,
                        p.videoUrls,
                        p.createdAt,
                        p.createdBy,
                        p.updatedAt,
                        p.updatedBy,
                        CAST(0.0 AS double),
                        CAST(0 AS integer)
                        )
                        FROM Product p
                        JOIN Category c ON p.categoryId=c.id
                        WHERE (:columnName = 'id' AND CAST(p.id AS string ) = :value )
                        OR (:columnName = 'slug' AND p.slug = :value)
            """)
    Optional<ProductResponse> findDetailProductByCondition(@Param("columnName") String columnName, @Param("value") String value);

    @Query("""
            SELECT p
            FROM Product p
            Where p.id IN :ids
            """)
    List<Product> findProductsByIds(@Param("ids") List<UUID> id);
}
