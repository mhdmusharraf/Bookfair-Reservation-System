package com.bookfair.common.realtime;

import com.bookfair.auth.entity.User;
import com.bookfair.auth.entity.VendorAccessRequest;
import com.bookfair.common.realtime.dto.NotificationMessage;
import com.bookfair.common.realtime.dto.StallStatusMessage;
import com.bookfair.common.realtime.dto.VendorAccessDecisionMessage;
import com.bookfair.common.realtime.dto.VendorAccessRequestMessage;
import com.bookfair.notification.entity.Notification;
import com.bookfair.payment.dto.PaymentResponse;
import com.bookfair.reservation.dto.ReservationResponse;
import com.bookfair.stall.entity.Stall;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class RealTimeGateway {

    private static final String VENDOR_REQUEST_TOPIC = "/topic/vendor-access/requests";
    private static final String VENDOR_DECISION_QUEUE = "/queue/vendor-access";
    private static final String STALL_STATUS_TOPIC = "/topic/stalls/status";
    private static final String USER_NOTIFICATION_QUEUE = "/queue/notifications";
    private static final String RECENT_RESERVATIONS_TOPIC = "/topic/reservations/recent";
    private static final String PAYMENTS_TOPIC = "/topic/payments/history";

    private final SimpMessagingTemplate messagingTemplate;

    public void publishVendorAccessRequest(VendorAccessRequest request) {
        VendorAccessRequestMessage payload = VendorAccessRequestMessage.builder()
                .requestId(request.getId())
                .vendorId(request.getVendor().getId())
                .businessName(request.getVendor().getBusinessName())
                .email(request.getVendor().getEmail())
                .contactNumber(request.getVendor().getContactNumber())
                .status(request.getStatus())
                .createdAt(request.getCreatedAt())
                .resolvedAt(request.getResolvedAt())
                .build();
        messagingTemplate.convertAndSend(VENDOR_REQUEST_TOPIC, payload);
    }

    public void publishVendorDecision(User vendor, String decision, String decidedBy) {
        VendorAccessDecisionMessage payload = VendorAccessDecisionMessage.builder()
                .vendorId(vendor.getId())
                .decision(decision)
                .decidedAt(LocalDateTime.now())
                .decidedBy(decidedBy)
                .build();
        messagingTemplate.convertAndSendToUser(vendor.getEmail(), VENDOR_DECISION_QUEUE, payload);
    }

    public void publishStallStatus(Stall stall) {
        StallStatusMessage payload = StallStatusMessage.builder()
                .stallId(stall.getId())
                .stallCode(stall.getCode())
                .status(stall.getStatus())
                .heldByVendorId(Optional.ofNullable(stall.getHeldBy()).map(User::getId).orElse(null))
                .heldByBusinessName(Optional.ofNullable(stall.getHeldBy()).map(User::getBusinessName).orElse(null))
                .holdExpiresAt(stall.getHoldExpiresAt())
                .build();
        messagingTemplate.convertAndSend(STALL_STATUS_TOPIC, payload);
    }

    public void publishNotification(Notification notification) {
        NotificationMessage payload = NotificationMessage.builder()
                .id(notification.getId())
                .type(notification.getType())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .link(notification.getLink())
                .read(notification.isRead())
                .createdAt(notification.getCreatedAt())
                .build();
        messagingTemplate.convertAndSendToUser(notification.getRecipient().getEmail(), USER_NOTIFICATION_QUEUE, payload);
    }

    public void publishReservation(ReservationResponse reservation) {
        messagingTemplate.convertAndSend(RECENT_RESERVATIONS_TOPIC, reservation);
    }

    public void publishPayment(PaymentResponse payment) {
        messagingTemplate.convertAndSend(PAYMENTS_TOPIC, payment);
    }
}
