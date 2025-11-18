package com.bookfair.auth.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.Map;
import java.util.function.Function;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtService {

    private static final String TOKEN_TYPE_CLAIM = "tokenType";
    private static final String ACCESS_TOKEN = "ACCESS";
    private static final String REFRESH_TOKEN = "REFRESH";

    @Value("${security.jwt.secret}")
    private String secret;

    @Value("${security.jwt.access-expiration-minutes:${security.jwt.expiration-minutes:60}}")
    private long accessExpirationMinutes;

    @Value("${security.jwt.refresh-expiration-days:7}")
    private long refreshExpirationDays;

    public String generateAccessToken(UserDetails userDetails) {
        return buildToken(Map.of(TOKEN_TYPE_CLAIM, ACCESS_TOKEN), userDetails, getAccessTokenTtlSeconds());
    }

    public String generateRefreshToken(UserDetails userDetails) {
        return buildToken(Map.of(TOKEN_TYPE_CLAIM, REFRESH_TOKEN), userDetails, getRefreshTokenTtlSeconds());
    }

    public boolean isAccessTokenValid(String token, UserDetails userDetails) {
        return isTokenValid(token, userDetails) && ACCESS_TOKEN.equalsIgnoreCase(extractTokenType(token));
    }

    public boolean isRefreshTokenValid(String token, UserDetails userDetails) {
        return isTokenValid(token, userDetails) && REFRESH_TOKEN.equalsIgnoreCase(extractTokenType(token));
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public LocalDateTime extractExpiration(String token) {
        Date expiration = extractClaim(token, Claims::getExpiration);
        return LocalDateTime.ofInstant(expiration.toInstant(), ZoneId.systemDefault());
    }

    public String extractTokenType(String token) {
        return extractClaim(token, claims -> claims.get(TOKEN_TYPE_CLAIM, String.class));
    }

    public long getAccessTokenTtlSeconds() {
        return accessExpirationMinutes * 60;
    }

    public long getRefreshTokenTtlSeconds() {
        return refreshExpirationDays * 24 * 60 * 60;
    }

    private String buildToken(Map<String, Object> extraClaims, UserDetails userDetails, long validitySeconds) {
        Instant now = Instant.now();
        Instant expiration = now.plusSeconds(validitySeconds);

        return Jwts.builder()
                .setClaims(extraClaims)
                .setSubject(userDetails.getUsername())
                .setIssuedAt(Date.from(now))
                .setExpiration(Date.from(expiration))
                .signWith(getSignInKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    private boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).isBefore(LocalDateTime.now());
    }

    private <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSignInKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private Key getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secret);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}

