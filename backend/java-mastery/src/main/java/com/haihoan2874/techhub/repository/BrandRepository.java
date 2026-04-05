package com.haihoan2874.techhub.repository;

import com.haihoan2874.techhub.model.Brand;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface BrandRepository extends JpaRepository<Brand, UUID> {
    Optional<Brand> findBySlug(String slug);
    boolean existsByName(String name);
    boolean existsBySlug(String slug);
}
