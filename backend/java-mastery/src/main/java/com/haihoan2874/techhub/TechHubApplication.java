package com.haihoan2874.techhub;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.EnableAspectJAutoProxy;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EnableJpaRepositories(basePackages = "com.haihoan2874.techhub.repository")
@EnableAspectJAutoProxy
public class TechHubApplication {
    private TechHubApplication() {
        // Utility class
    }

    public static void main(String[] args) {
        SpringApplication.run(TechHubApplication.class, args);
    }

}
