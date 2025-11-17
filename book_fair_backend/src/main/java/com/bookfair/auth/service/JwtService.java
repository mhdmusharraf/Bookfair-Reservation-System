package com.bookfair.auth.service;

import com.bookfair.auth.entity.User;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.Map;

@Slf4j
@Service
public class JwtService {

    private final Key signingKey;
    private final long jwtExpirationMs;

    public JwtService(@Value("${security.jwt.secret-key}") String secret,
                      @Value("${jwt.expirationMs:3600000}") long jwtExpirationMs) {
        this.signingKey = Keys.hmacShaKeyFor(secret.getBytes());
        this.jwtExpirationMs = jwtExpirationMs;
    }

    public String generateToken(User user, Long vendorId, Long employeeId) {
        long now = System.currentTimeMillis();
        Date issuedAt = new Date(now);
        Date exp = new Date(now + jwtExpirationMs);

        JwtBuilder builder = Jwts.builder()
                .setSubject(user.getEmail())
                .setIssuedAt(issuedAt)
                .setExpiration(exp)
                .claim("userId", user.getId())
                .claim("role", user.getRole().name());

        if (vendorId != null) builder.claim("vendorId", vendorId);
        if (employeeId != null) builder.claim("employeeId", employeeId);

        return builder.signWith(signingKey, SignatureAlgorithm.HS256).compact();
    }

    public Jws<Claims> parseToken(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(signingKey)
                    .build()
                    .parseClaimsJws(token);
        } catch (JwtException ex) {
            log.warn("Invalid or expired JWT: {}", ex.getMessage());
            throw ex;
        }
    }

    public boolean validateToken(String token) {
        try {
            parseToken(token);
            return true;
        } catch (JwtException e) {
            return false;
        }
    }

    public Long extractUserId(String token) {
        Claims claims = parseToken(token).getBody();
        Object v = claims.get("userId");
        if (v == null) return null;

        // Handle both Integer and Long types from JWT
        if (v instanceof Number) {
            return ((Number) v).longValue();
        }
        return Long.valueOf(v.toString());
    }

    public Long extractVendorId(String token) {
        Claims claims = parseToken(token).getBody();
        Object v = claims.get("vendorId");
        if (v == null) return null;
        if (v instanceof Number) {
            return ((Number) v).longValue();
        }
        return Long.valueOf(v.toString());
    }

    public Long extractEmployeeId(String token) {
        Claims claims = parseToken(token).getBody();
        Object v = claims.get("employeeId");
        if (v == null) return null;
        if (v instanceof Number) {
            return ((Number) v).longValue();
        }
        return Long.valueOf(v.toString());
    }



    public String extractEmail(String token) {
        Claims claims = parseToken(token).getBody();
        return claims.getSubject();
    }

    public String extractRole(String token) {
        Claims claims = parseToken(token).getBody();
        Object r = claims.get("role");
        return r == null ? null : r.toString();
    }

    public Map<String, Object> extractAllClaims(String token) {
        return parseToken(token).getBody();
    }
}
