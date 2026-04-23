# S-Life Backend - Spring Boot E-commerce API

This is the backend service for the **S-Life Graduation Project** (E-commerce platform for Smartphones and Accessories). 
It provides RESTful APIs for client storefronts, Admin dashboards, and AI integrations.

## Overview

- **Framework**: Spring Boot 4.0.0 with Spring Security 6.5
- **Authentication**: JWT token-based (60-minute expiration) & OAuth2 (Google/Facebook - upcoming)
- **Database**: PostgreSQL 16 with Hibernate ORM & Flyway migrations
- **Session/Cache**: Redis (for Cart & Session)
- **AI Integration**: Google Gemini 1.5 Flash API (Product Advisory)
- **Payment**: VNPay Gateway Integration (upcoming)
- **Java**: Version 21 (LTS)

## Features

✅ **Authentication & Security**
- User Registration & Login with JWT
- Role-Based Access Control (ROLE_USER, ROLE_ADMIN)

✅ **Core E-commerce**
- **Products & Categories**: Manage products, brands, and categories mapping.
- **Dynamic Specs**: Technical specifications stored via JSONB for flexible queries.
- **Inventory**: Quantity tracking, restock history, low-stock warnings.
- **Orders & Checkout**: Cart management (via Redis), Order creation, Delivery tracking.

✅ **System Architecture**
- Global Exception Handling & Input Validation
- PostgreSQL with Flyway schema migrations
- MapStruct type-safe DTO mapping
- Swagger/OpenAPI documentation

## Project Structure

```
backend/java-mastery/
├── src/main/java/com/conglt/learning/springbootboilerplate/
│   ├── configuration/              # Security, CORS, Swagger
│   ├── controller/                 # REST APIs
│   ├── dto/                        # Request/Response models used by APIs
│   ├── exceptions/                 # Global error handling
│   ├── model/                      # JPA Entities (User, Product, Brand, Order...)
│   ├── repository/                 # Data access layer (JpaRepository)
│   ├── security/                   # JWT processing chains
│   └── service/                    # Business Logic Layer
│
├── src/main/resources/
│   ├── application.properties      # Connection strings
│   └── db/migration/               # Flyway SQL version scripts
│
├── docker-compose.yml              # PostgreSQL + Redis environment
└── build.gradle                    # Dependecies declaration
```

## Quick Start

### 1. Start External Services (Database & Redis)
Ensure Docker is installed, then spin up the required databases:
```bash
cp .env.example .env
docker-compose up -d postgres
# (Docker compose currently has postgres, soon to include redis)
```

### 2. Build & Run Application
For development with Hot-Reload enabled:
```bash
./gradlew bootRun -t
```
Alternatively, build entirely:
```bash
./gradlew clean build -x test
```

### 3. Verify & Access
**Swagger UI Documentation:**
```
http://localhost:8089/swagger-ui.html
```

**Health Check endpoint:**
```bash
curl http://localhost:8089/health
```

---

**Version**: 1.0.0 (Graduation Project Development Phase)
**Author**: Hoan (S-Life Workspace)

