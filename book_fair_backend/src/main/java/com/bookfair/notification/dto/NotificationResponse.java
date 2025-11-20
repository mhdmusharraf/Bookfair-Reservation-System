package com.bookfair.notification.dto;

import com.bookfair.notification.entity.NotificationType;
import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;

@Value
@Builder
public class NotificationResponse {
    Long id;
    NotificationType type;
    String title;
    String message;
    String link;
    boolean read;
    LocalDateTime createdAt;
}

