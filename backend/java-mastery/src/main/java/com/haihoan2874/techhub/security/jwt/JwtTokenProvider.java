package com.haihoan2874.techhub.security.jwt;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;

/**
 * JWT Token Provider for generating and validating JWT tokens.
 */
@Component
public class JwtTokenProvider {

    @Value("${jwt.secretKey:your-secret-key-change-in-production}")
    private String secretKey;

    @Value("${jwt.issuer:S-Life}")
    private String issuer;

    @Value("${jwt.expirationMinute:1440}")
    private int expirationMinute;

    /**
     * Generate JWT token for the given subject (username).
     *
     * @param subject the subject (username) to include in the token
     * @return the generated JWT token
     */
    public String generateToken(String subject, String role) {
        Algorithm algorithm = Algorithm.HMAC256(secretKey);
        Instant now = Instant.now();
        Instant expiresAt = now.plus(expirationMinute, ChronoUnit.MINUTES);

        return JWT.create()
                .withSubject(subject)
                .withClaim("role", role)
                .withIssuer(issuer)
                .withIssuedAt(now)
                .withExpiresAt(expiresAt)
                .sign(algorithm);
    }

    public String getRoleFromToken(String token) {
        try {
            Algorithm algorithm = Algorithm.HMAC256(secretKey);
            DecodedJWT decodedJWT = JWT.require(algorithm)
                    .withIssuer(issuer)
                    .build()
                    .verify(token);
            return decodedJWT.getClaim("role").asString();
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * Validate JWT token signature and expiration.
     *
     * @param token the JWT token to validate
     * @return true if token is valid, false otherwise
     */
    public boolean validateToken(String token) {
        try {
            Algorithm algorithm = Algorithm.HMAC256(secretKey);
            JWT.require(algorithm)
                    .withIssuer(issuer)
                    .build()
                    .verify(token);
            return !isTokenExpired(token);
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Extract subject (username) from JWT token.
     *
     * @param token the JWT token
     * @return the subject (username) from the token
     */
    public String getSubjectFromToken(String token) {
        try {
            Algorithm algorithm = Algorithm.HMAC256(secretKey);
            DecodedJWT decodedJWT = JWT.require(algorithm)
                    .withIssuer(issuer)
                    .build()
                    .verify(token);
            return decodedJWT.getSubject();
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * Check if JWT token is expired.
     *
     * @param token the JWT token
     * @return true if token is expired, false otherwise
     */
    public boolean isTokenExpired(String token) {
        try {
            Algorithm algorithm = Algorithm.HMAC256(secretKey);
            DecodedJWT decodedJWT = JWT.require(algorithm)
                    .withIssuer(issuer)
                    .build()
                    .verify(token);
            return decodedJWT.getExpiresAt().before(Date.from(Instant.now()));
        } catch (Exception e) {
            return true;
        }
    }
}
