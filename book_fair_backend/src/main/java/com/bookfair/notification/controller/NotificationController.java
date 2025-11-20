package com.bookfair.notification.controller;

import com.bookfair.auth.entity.User;
import com.bookfair.auth.service.UserService;
import com.bookfair.notification.dto.NotificationResponse;
import com.bookfair.notification.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@Tag(name = "Notifications")
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final UserService userService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "List recent notifications for the signed-in user")
    public ResponseEntity<List<NotificationResponse>> latest(@RequestParam(value = "limit", defaultValue = "20") int limit) {
        User user = userService.getCurrentUser();
        return ResponseEntity.ok(notificationService.getLatest(user, limit));
    }

    @GetMapping("/unread-count")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Count unread notifications for the signed-in user")
    public ResponseEntity<Map<String, Long>> unreadCount() {
        User user = userService.getCurrentUser();
        long count = notificationService.getUnreadCount(user);
        return ResponseEntity.ok(Map.of("count", count));
    }

    @PostMapping("/{id}/read")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Mark a notification as read")
    public ResponseEntity<NotificationResponse> markAsRead(@PathVariable("id") Long notificationId) {
        User user = userService.getCurrentUser();
        return ResponseEntity.ok(notificationService.markAsRead(notificationId, user));
    }

    @PostMapping("/mark-all-read")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Mark all notifications as read for the signed-in user")
    public ResponseEntity<Void> markAllRead() {
        User user = userService.getCurrentUser();
        notificationService.markAllAsRead(user);
        return ResponseEntity.noContent().build();
    }
}

