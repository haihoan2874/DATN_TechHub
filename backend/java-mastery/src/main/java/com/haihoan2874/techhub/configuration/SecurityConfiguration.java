package com.haihoan2874.techhub.configuration;

import com.haihoan2874.techhub.security.jwt.JwtAuthenticationEntryPoint;
import com.haihoan2874.techhub.security.jwt.JwtAuthenticationFilter;
import com.haihoan2874.techhub.security.jwt.JwtAuthenticationForBidden;
import com.haihoan2874.techhub.security.jwt.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * Security Configuration for Spring Security with JWT authentication.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfiguration {

    private final JwtTokenProvider jwtTokenProvider;
    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
    private final JwtAuthenticationForBidden jwtAuthenticationForBidden;
    private final com.haihoan2874.techhub.security.service.CustomOAuth2UserService customOAuth2UserService;
    private final com.haihoan2874.techhub.security.OAuth2AuthenticationSuccessHandler oAuth2AuthenticationSuccessHandler;

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter(jwtTokenProvider);
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .exceptionHandling(exceptionHandling ->
                        exceptionHandling
                                .authenticationEntryPoint(jwtAuthenticationEntryPoint)
                                .accessDeniedHandler(jwtAuthenticationForBidden)
                )
                .sessionManagement(sessionManagement ->
                        sessionManagement.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                )
                .authorizeHttpRequests(authorizeRequests ->
                        authorizeRequests
                                .requestMatchers(
                                        "/api/v1/auth/login",
                                        "/api/v1/auth/register",
                                        "/api/v1/auth/forgot-password",
                                        "/api/v1/auth/verify-otp",
                                        "/api/v1/auth/reset-password",
                                        "/api/v1/auth/oauth2/**",
                                        "/api/v1/auth/**",
                                        "/api/v1/health",
                                        "/health",
                                        "/v3/api-docs/**",
                                        "/swagger-ui/**",
                                        "/swagger-ui.html",
                                        "/actuator/**",
                                        "/api/v1/system/**",
                                        "/api/v1/files/**"
                                ).permitAll()
                                .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
                                .requestMatchers(HttpMethod.GET, "/api/v1/categories/**").permitAll()
                                .requestMatchers(HttpMethod.GET, "/api/v1/brands/**").permitAll()
                                .requestMatchers(HttpMethod.GET, "/api/v1/products/**").permitAll()
                                .requestMatchers(HttpMethod.GET, "/api/v1/reviews/products/**").permitAll()
                                .requestMatchers("/api/v1/ai/**").authenticated()
                                .requestMatchers("/api/v1/cart/**").authenticated()
                                .requestMatchers("/api/v1/orders/**").authenticated()
                                .requestMatchers("/api/v1/addresses/**").authenticated()
                                .requestMatchers("/api/v1/reviews/**").authenticated()
                                .anyRequest().authenticated()
                )
                .oauth2Login(oauth2 -> oauth2
                        .userInfoEndpoint(userInfo -> userInfo
                                .userService(customOAuth2UserService)
                        )
                        .successHandler(oAuth2AuthenticationSuccessHandler)
                        .failureUrl("http://localhost:5173/login?error=oauth2")
                )
                .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:5173"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("authorization", "content-type", "x-auth-token"));
        configuration.setExposedHeaders(List.of("x-auth-token"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }
}
