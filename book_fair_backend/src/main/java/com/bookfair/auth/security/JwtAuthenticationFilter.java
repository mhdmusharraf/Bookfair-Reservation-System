package com.bookfair.auth.security;

import com.bookfair.auth.repository.UserRepository;
import com.bookfair.common.constants.LoginPortal;
import com.bookfair.common.util.PortalRequestUtils;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final String ACCESS_TOKEN_COOKIE = "access_token";

    private final JwtService jwtService;
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        LoginPortal portal = PortalRequestUtils.resolvePortal(request).orElse(null);
        final String jwt = resolveToken(request, portal);
        if (!StringUtils.hasText(jwt)) {
            filterChain.doFilter(request, response);
            return;
        }

        final String userEmail;
        try {
            userEmail = jwtService.extractUsername(jwt);
        } catch (JwtException | IllegalArgumentException ex) {
            log.warn("Failed to parse JWT token", ex);
            SecurityContextHolder.clearContext();
            filterChain.doFilter(request, response);
            return;
        }

        if (StringUtils.hasText(userEmail) && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = userRepository.findByEmail(userEmail).orElse(null);
            boolean valid = portal == null
                    ? jwtService.isAccessTokenValid(jwt, userDetails)
                    : jwtService.isAccessTokenValidForPortal(jwt, userDetails, portal);
            if (userDetails != null && valid) {
                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        filterChain.doFilter(request, response);
    }

    private String resolveToken(HttpServletRequest request, LoginPortal portal) {
        final String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (StringUtils.hasText(authHeader) && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        Cookie[] cookies = request.getCookies();
        if (cookies == null || cookies.length == 0) {
            return null;
        }
        if (portal != null) {
            return Arrays.stream(cookies)
                    .filter(cookie -> PortalRequestUtils.cookieName(ACCESS_TOKEN_COOKIE, portal).equals(cookie.getName()))
                    .map(Cookie::getValue)
                    .findFirst()
                    .orElse(null);
        }
        List<String> candidateNames = PortalRequestUtils.cookieNamesForAllPortals(ACCESS_TOKEN_COOKIE);
        return Arrays.stream(cookies)
                .filter(cookie -> candidateNames.contains(cookie.getName()))
                .map(Cookie::getValue)
                .findFirst()
                .orElse(null);
    }
}

