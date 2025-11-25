package com.bookfair.notification.controller;

import com.bookfair.auth.entity.User;
import com.bookfair.auth.service.UserService;
import com.bookfair.notification.dto.NotificationResponse;
import com.bookfair.notification.entity.NotificationType;
import com.bookfair.notification.service.NotificationService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationControllerTest {

    @Mock
    private NotificationService notificationService;

    @Mock
    private UserService userService;

    @InjectMocks
    private com.bookfair.notification.controller.NotificationController controller;

    @Test
    void latest_returnsListFromService_withLimit() {
        User user = User.builder().id(1L).email("u@x.com").build();
        when(userService.getCurrentUser()).thenReturn(user);

        NotificationResponse n1 = NotificationResponse.builder()
            .id(1L)
            .type(NotificationType.VENDOR_ACCESS_REQUEST)
            .title("T1")
            .message("M1")
            .link(null)
            .read(false)
            .createdAt(LocalDateTime.now())
            .build();

        when(notificationService.getLatest(eq(user), eq(10))).thenReturn(List.of(n1));

        ResponseEntity<List<NotificationResponse>> resp = controller.latest(10);

        assertThat(resp.getStatusCodeValue()).isEqualTo(200);
        assertThat(resp.getBody()).containsExactly(n1);
    }

    @Test
    void unreadCount_returnsCountMap() {
        User user = User.builder().id(2L).email("u2@x.com").build();
        when(userService.getCurrentUser()).thenReturn(user);
        when(notificationService.getUnreadCount(eq(user))).thenReturn(5L);

        ResponseEntity<Map<String, Long>> resp = controller.unreadCount();

        assertThat(resp.getStatusCodeValue()).isEqualTo(200);
        assertThat(resp.getBody()).containsEntry("count", 5L);
    }

    @Test
    void markAsRead_returnsUpdatedNotification() {
        User user = User.builder().id(3L).email("u3@x.com").build();
        when(userService.getCurrentUser()).thenReturn(user);

        NotificationResponse updated = NotificationResponse.builder()
            .id(7L)
            .type(NotificationType.VENDOR_ACCESS_APPROVED)
            .title("t")
            .message("m")
            .link(null)
            .read(true)
            .createdAt(LocalDateTime.now())
            .build();

        when(notificationService.markAsRead(eq(7L), eq(user))).thenReturn(updated);

        ResponseEntity<NotificationResponse> resp = controller.markAsRead(7L);

        assertThat(resp.getStatusCodeValue()).isEqualTo(200);
        assertThat(resp.getBody()).isEqualTo(updated);
    }

    @Test
    void markAllRead_invokesService_andReturnsNoContent() {
        User user = User.builder().id(4L).email("u4@x.com").build();
        when(userService.getCurrentUser()).thenReturn(user);

        doNothing().when(notificationService).markAllAsRead(eq(user));

        ResponseEntity<Void> resp = controller.markAllRead();

        assertThat(resp.getStatusCodeValue()).isEqualTo(204);
        verify(notificationService, times(1)).markAllAsRead(eq(user));
    }
}