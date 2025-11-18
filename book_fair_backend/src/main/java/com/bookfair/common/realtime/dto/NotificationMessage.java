package com.bookfair.common.realtime.dto;

import com.bookfair.notification.entity.NotificationType;
import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;

@Value
@Builder
public class NotificationMessage {
    Long id;
    NotificationType type;
    String title;
    String message;
    String link;
    boolean read;
    LocalDateTime createdAt;
}

