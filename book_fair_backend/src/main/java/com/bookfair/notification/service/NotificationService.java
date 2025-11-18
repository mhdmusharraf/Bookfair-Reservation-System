package com.bookfair.notification.service;

import com.bookfair.auth.entity.User;
import com.bookfair.auth.repository.UserRepository;
import com.bookfair.common.constants.Role;
import com.bookfair.common.realtime.RealTimeGateway;
import com.bookfair.notification.dto.NotificationResponse;
import com.bookfair.notification.entity.Notification;
import com.bookfair.notification.entity.NotificationType;
import com.bookfair.notification.repository.NotificationRepository;
import com.bookfair.reservation.entity.Reservation;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private static final int MAX_PAGE_SIZE = 50;

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final RealTimeGateway realTimeGateway;

    @Transactional
    public void notifyEmployeesOfVendorRequest(String businessName) {
        String title = "New vendor access request";
        String message = businessName + " requested access to the vendor portal.";
        notifyRole(Role.EMPLOYEE, NotificationType.VENDOR_ACCESS_REQUEST, title, message, "/join-requests");
    }

    @Transactional
    public void notifyVendorAccessApproved(User vendor, User employee) {
        String title = "Access request approved";
        String message = String.format("%s approved your vendor portal access request.", employee.getBusinessName());
        createNotification(vendor, NotificationType.VENDOR_ACCESS_APPROVED, title, message, "/");
    }

    @Transactional
    public void notifyEmployeesOfReservation(Reservation reservation) {
        String title = "New reservation confirmed";
        String message = reservation.getUser().getBusinessName() + " booked " + reservation.getStalls().size() + " stall(s).";
        notifyRole(Role.EMPLOYEE, NotificationType.RESERVATION_CREATED, title, message, "/");
    }

    @Transactional
    public NotificationResponse createNotification(User recipient, NotificationType type, String title, String message, String link) {
        Notification notification = Notification.builder()
                .recipient(recipient)
                .type(type)
                .title(title)
                .message(message)
                .link(link)
                .read(false)
                .createdAt(LocalDateTime.now())
                .build();
        Notification saved = notificationRepository.save(notification);
        realTimeGateway.publishNotification(saved);
        return toResponse(saved);
    }

    @Transactional
    public void notifyRole(Role role, NotificationType type, String title, String message, String link) {
        List<User> recipients = userRepository.findAllByRole(role);
        for (User recipient : recipients) {
            createNotification(recipient, type, title, message, link);
        }
    }

    @Transactional
    public NotificationResponse markAsRead(Long notificationId, User user) {
        Notification notification = notificationRepository.findByIdAndRecipient(notificationId, user)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found"));
        if (!notification.isRead()) {
            notification.setRead(true);
            notification.setReadAt(LocalDateTime.now());
            notificationRepository.save(notification);
        }
        return toResponse(notification);
    }

    @Transactional
    public void markAllAsRead(User user) {
        List<Notification> unread = notificationRepository.findByRecipientAndReadIsFalse(user);
        if (unread.isEmpty()) {
            return;
        }
        LocalDateTime now = LocalDateTime.now();
        unread.forEach(notification -> {
            notification.setRead(true);
            notification.setReadAt(now);
        });
        notificationRepository.saveAll(unread);
    }

    @Transactional
    public List<NotificationResponse> getLatest(User user, int limit) {
        int pageSize = Math.min(Math.max(limit, 1), MAX_PAGE_SIZE);
        return notificationRepository.findByRecipientOrderByCreatedAtDesc(user, PageRequest.of(0, pageSize)).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public long getUnreadCount(User user) {
        return notificationRepository.countByRecipientAndReadIsFalse(user);
    }

    private NotificationResponse toResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .type(notification.getType())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .link(notification.getLink())
                .read(notification.isRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}

