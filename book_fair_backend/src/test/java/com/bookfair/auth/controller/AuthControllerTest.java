package com.bookfair.auth.controller;

import com.bookfair.auth.dto.AuthResponse;
import com.bookfair.auth.dto.AuthSession;
import com.bookfair.auth.dto.LoginRequest;
import com.bookfair.auth.dto.RegisterRequest;
import com.bookfair.auth.dto.UserProfileResponse;
import com.bookfair.auth.entity.User;
import com.bookfair.auth.service.UserService;
import com.bookfair.common.constants.LoginPortal;
import com.bookfair.common.util.PortalRequestUtils;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpHeaders;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    private UserService userService;

    @InjectMocks
    private AuthController controller;

    @Test
    void registerVendor_setsCookiesAndReturnsResponse() {
        RegisterRequest req = new RegisterRequest();
        req.setBusinessName("B");
        req.setContactNumber("0112345");
        req.setEmail("a@b.com");
        req.setPassword("password123");

        UserProfileResponse profile = UserProfileResponse.builder()
                .id(1L)
                .businessName("B")
                .contactNumber("0112345")
                .email("a@b.com")
                .createdAt(LocalDateTime.now())
                .build();

        AuthResponse authResponse = AuthResponse.builder()
                .user(profile)
                .expiresAt(LocalDateTime.now().plusHours(1))
                .build();

        AuthSession session = AuthSession.builder()
                .response(authResponse)
                .accessToken("access-xyz")
                .refreshToken("refresh-abc")
                .accessTokenTtlSeconds(3600)
                .refreshTokenTtlSeconds(7200)
                .portal(LoginPortal.VENDOR)
                .build();

        when(userService.registerVendor(any(RegisterRequest.class))).thenReturn(session);

        MockHttpServletResponse response = new MockHttpServletResponse();
        var respEntity = controller.registerVendor(req, response);

        assertThat(respEntity.getStatusCodeValue()).isEqualTo(200);
        assertThat(respEntity.getBody()).isEqualTo(authResponse);

        List<?> setCookies = response.getHeaderValues(HttpHeaders.SET_COOKIE);
        assertThat(setCookies).isNotEmpty();
        // verify cookie names and values for portal
        assertThat(setCookies.stream().map(Object::toString).anyMatch(s -> s.contains("access_token_vendor=access-xyz"))).isTrue();
        assertThat(setCookies.stream().map(Object::toString).anyMatch(s -> s.contains("refresh_token_vendor=refresh-abc"))).isTrue();
    }

    @Test
    void registerEmployee_setsCookiesAndReturnsResponse() {
        RegisterRequest req = new RegisterRequest();
        req.setBusinessName("E");
        req.setContactNumber("0112345");
        req.setEmail("e@b.com");
        req.setPassword("password123");

        AuthResponse authResponse = AuthResponse.builder()
                .user(UserProfileResponse.builder().id(2L).email("e@b.com").build())
                .expiresAt(LocalDateTime.now().plusHours(1))
                .build();

        AuthSession session = AuthSession.builder()
                .response(authResponse)
                .accessToken("a2")
                .refreshToken("r2")
                .accessTokenTtlSeconds(100)
                .refreshTokenTtlSeconds(200)
                .portal(LoginPortal.EMPLOYEE)
                .build();

        when(userService.registerEmployee(any(RegisterRequest.class))).thenReturn(session);

        MockHttpServletResponse response = new MockHttpServletResponse();
        var respEntity = controller.registerEmployee(req, response);

        assertThat(respEntity.getStatusCodeValue()).isEqualTo(200);
        assertThat(respEntity.getBody()).isEqualTo(authResponse);

        List<?> setCookies = response.getHeaderValues(HttpHeaders.SET_COOKIE);
        assertThat(setCookies.stream().map(Object::toString).anyMatch(s -> s.contains("access_token_employee=a2"))).isTrue();
        assertThat(setCookies.stream().map(Object::toString).anyMatch(s -> s.contains("refresh_token_employee=r2"))).isTrue();
    }

    @Test
    void login_setsCookiesAndReturnsResponse() {
        LoginRequest req = new LoginRequest();
        req.setEmail("l@b.com");
        req.setPassword("pwd");
        req.setPortal(LoginPortal.VENDOR);

        AuthResponse authResponse = AuthResponse.builder()
                .user(UserProfileResponse.builder().id(3L).email("l@b.com").build())
                .expiresAt(LocalDateTime.now().plusHours(1))
                .build();

        AuthSession session = AuthSession.builder()
                .response(authResponse)
                .accessToken("la")
                .refreshToken("lr")
                .accessTokenTtlSeconds(100)
                .refreshTokenTtlSeconds(200)
                .portal(LoginPortal.VENDOR)
                .build();

        when(userService.authenticate(any(LoginRequest.class))).thenReturn(session);

        MockHttpServletResponse response = new MockHttpServletResponse();
        var respEntity = controller.login(req, response);

        assertThat(respEntity.getStatusCodeValue()).isEqualTo(200);
        assertThat(respEntity.getBody()).isEqualTo(authResponse);

        List<?> setCookies = response.getHeaderValues(HttpHeaders.SET_COOKIE);
        assertThat(setCookies.stream().map(Object::toString).anyMatch(s -> s.contains("access_token_vendor=la"))).isTrue();
        assertThat(setCookies.stream().map(Object::toString).anyMatch(s -> s.contains("refresh_token_vendor=lr"))).isTrue();
    }

    @Test
    void refresh_withValidCookie_refreshesSessionAndSetsCookies() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();

        Cookie cookie = new Cookie(PortalRequestUtils.cookieName("refresh_token", LoginPortal.VENDOR), "refresh-123");
        request.setCookies(cookie);

        AuthResponse authResponse = AuthResponse.builder()
                .user(UserProfileResponse.builder().id(4L).email("r@b.com").build())
                .expiresAt(LocalDateTime.now().plusMinutes(30))
                .build();

        AuthSession session = AuthSession.builder()
                .response(authResponse)
                .accessToken("new-a")
                .refreshToken("new-r")
                .accessTokenTtlSeconds(50)
                .refreshTokenTtlSeconds(100)
                .portal(LoginPortal.VENDOR)
                .build();

        when(userService.refreshSession(eq("refresh-123"), eq(LoginPortal.VENDOR))).thenReturn(session);

        try (MockedStatic<PortalRequestUtils> mocked = mockStatic(PortalRequestUtils.class)) {
            mocked.when(() -> PortalRequestUtils.resolvePortal(any(HttpServletRequest.class))).thenReturn(Optional.of(LoginPortal.VENDOR));
            mocked.when(() -> PortalRequestUtils.cookieName("refresh_token", LoginPortal.VENDOR)).thenReturn("refresh_token_vendor");
            mocked.when(() -> PortalRequestUtils.cookieName("access_token", LoginPortal.VENDOR)).thenReturn("access_token_vendor");

            var respEntity = controller.refresh(request, response);

            assertThat(respEntity.getStatusCodeValue()).isEqualTo(200);
            assertThat(respEntity.getBody()).isEqualTo(authResponse);

            List<?> setCookies = response.getHeaderValues(HttpHeaders.SET_COOKIE);
            assertThat(setCookies.stream().map(Object::toString).anyMatch(s -> s.contains("access_token_vendor=new-a"))).isTrue();
            assertThat(setCookies.stream().map(Object::toString).anyMatch(s -> s.contains("refresh_token_vendor=new-r"))).isTrue();
        }
    }

    @Test
    void refresh_missingCookie_throwsUnauthorized() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();

        try (MockedStatic<PortalRequestUtils> mocked = mockStatic(PortalRequestUtils.class)) {
            mocked.when(() -> PortalRequestUtils.resolvePortal(any(HttpServletRequest.class))).thenReturn(Optional.of(LoginPortal.VENDOR));
            mocked.when(() -> PortalRequestUtils.cookieName("refresh_token", LoginPortal.VENDOR)).thenReturn("refresh_token_vendor");
            mocked.when(() -> PortalRequestUtils.cookieName("access_token", LoginPortal.VENDOR)).thenReturn("access_token_vendor");

            assertThatThrownBy(() -> controller.refresh(request, response))
                    .isInstanceOf(org.springframework.web.server.ResponseStatusException.class)
                    .hasMessageContaining("Refresh token missing");
        }
    }

    @Test
    void logout_withPortal_expiresOnlyPortalCookies() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();

        try (MockedStatic<PortalRequestUtils> mocked = mockStatic(PortalRequestUtils.class)) {
            mocked.when(() -> PortalRequestUtils.resolvePortal(any(HttpServletRequest.class))).thenReturn(Optional.of(LoginPortal.EMPLOYEE));
            mocked.when(() -> PortalRequestUtils.cookieName("access_token", LoginPortal.EMPLOYEE)).thenReturn("access_token_employee");
            mocked.when(() -> PortalRequestUtils.cookieName("refresh_token", LoginPortal.EMPLOYEE)).thenReturn("refresh_token_employee");

            var resp = controller.logout(request, response);
            assertThat(resp.getStatusCodeValue()).isEqualTo(204);

            List<?> cookies = response.getHeaderValues(HttpHeaders.SET_COOKIE);
            // should expire two cookies for the employee portal
            assertThat(cookies.stream().map(Object::toString).anyMatch(s -> s.contains("access_token_employee="))).isTrue();
            assertThat(cookies.stream().map(Object::toString).anyMatch(s -> s.contains("refresh_token_employee="))).isTrue();
            assertThat(cookies.size()).isEqualTo(2);
        }
    }

    @Test
    void logout_withoutPortal_expiresAllPortalCookies() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();

        try (MockedStatic<PortalRequestUtils> mocked = mockStatic(PortalRequestUtils.class)) {
            mocked.when(() -> PortalRequestUtils.resolvePortal(any(HttpServletRequest.class))).thenReturn(Optional.empty());
            mocked.when(() -> PortalRequestUtils.cookieNamesForAllPortals("access_token"))
                .thenReturn(List.of("access_token", "access_token_vendor", "access_token_employee"));
            mocked.when(() -> PortalRequestUtils.cookieNamesForAllPortals("refresh_token"))
                .thenReturn(List.of("refresh_token", "refresh_token_vendor", "refresh_token_employee"));

            var resp = controller.logout(request, response);
            assertThat(resp.getStatusCodeValue()).isEqualTo(204);

            List<?> cookies = response.getHeaderValues(HttpHeaders.SET_COOKIE);
            // cookieNamesForAllPortals returns base + per-portal names -> with 2 portals => 3 names per token => total 6
            assertThat(cookies.size()).isEqualTo(6);
            assertThat(cookies.stream().map(Object::toString).anyMatch(s -> s.contains("access_token_vendor="))).isTrue();
            assertThat(cookies.stream().map(Object::toString).anyMatch(s -> s.contains("refresh_token_employee="))).isTrue();
        }
    }

    @Test
    void me_returnsUserProfile() {
        User user = User.builder().id(10L).email("me@b.com").build();
        UserProfileResponse profile = UserProfileResponse.builder().id(10L).email("me@b.com").build();

        when(userService.getCurrentUser()).thenReturn(user);
        when(userService.buildProfile(user)).thenReturn(profile);

        var resp = controller.me();

        assertThat(resp.getStatusCodeValue()).isEqualTo(200);
        assertThat(resp.getBody()).isEqualTo(profile);
    }
}