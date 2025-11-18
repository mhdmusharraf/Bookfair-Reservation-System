package com.bookfair.common.util;

import com.bookfair.common.constants.LoginPortal;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

public final class PortalRequestUtils {

    public static final String PORTAL_HEADER = "X-Portal";

    private PortalRequestUtils() {
    }

    public static Optional<LoginPortal> resolvePortal(HttpServletRequest request) {
        if (request == null) {
            return Optional.empty();
        }
        return resolvePortal(request.getHeader(PORTAL_HEADER));
    }

    public static Optional<LoginPortal> resolvePortal(String headerValue) {
        if (!StringUtils.hasText(headerValue)) {
            return Optional.empty();
        }
        try {
            return Optional.of(LoginPortal.valueOf(headerValue.trim().toUpperCase(Locale.ROOT)));
        } catch (IllegalArgumentException ex) {
            return Optional.empty();
        }
    }

    public static String cookieName(String baseName, LoginPortal portal) {
        if (portal == null) {
            return baseName;
        }
        return baseName + "_" + portal.name().toLowerCase(Locale.ROOT);
    }

    public static List<String> cookieNamesForAllPortals(String baseName) {
        List<String> names = new ArrayList<>();
        names.add(baseName);
        for (LoginPortal portal : LoginPortal.values()) {
            names.add(cookieName(baseName, portal));
        }
        return names;
    }
}
