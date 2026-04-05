package com.haihoan2874.techhub.configuration;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Swagger/OpenAPI Configuration for API documentation.
 */
@Configuration
@ConfigurationProperties(prefix = "swagger")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SwaggerConfiguration {

    private String appName;
    private String appDescription;
    private String appVersion;
    private String appLicense;
    private String appLicenseUrl;
    private String contactName;
    private String contactMail;
    private String contactUrl;

    @Bean
    public OpenAPI customOpenAPI() {
        Contact contact = new Contact()
                .name(contactName)
                .email(contactMail)
                .url(contactUrl);

        Info info = new Info()
                .title(appName)
                .description(appDescription)
                .version(appVersion)
                .contact(contact)
                .license(new io.swagger.v3.oas.models.info.License()
                        .name(appLicense)
                        .url(appLicenseUrl));

        SecurityScheme securityScheme = new SecurityScheme()
                .type(SecurityScheme.Type.HTTP)
                .scheme("bearer")
                .bearerFormat("JWT")
                .description("JWT token");

        SecurityRequirement securityRequirement = new SecurityRequirement()
                .addList("bearer");

        return new OpenAPI()
                .info(info)
                .components(new Components()
                        .addSecuritySchemes("bearer", securityScheme))
                .addSecurityItem(securityRequirement);
    }
}

