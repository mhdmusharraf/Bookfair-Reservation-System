package com.bookfair.reservation.entity;

import com.bookfair.auth.entity.User;
import com.bookfair.stall.entity.Stall;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
@ToString(exclude = {"user", "stalls"})
@Entity
@Table(name = "reservations", uniqueConstraints = {
        @UniqueConstraint(name = "uk_reservations_confirmation", columnNames = "confirmation_code")
})
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Builder.Default
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "reservation_stalls",
            joinColumns = @JoinColumn(name = "reservation_id"),
            inverseJoinColumns = @JoinColumn(name = "stall_id"))
    private Set<Stall> stalls = new HashSet<>();

    @Column(name = "status", nullable = false)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ReservationStatus status = ReservationStatus.PENDING_PAYMENT;

    @Column(name = "total_amount")
    private Long totalAmount; // store in cents

    @Column(name = "currency", length = 10)
    private String currency = "usd";

    @Column(name = "stripe_session_id")
    private String stripeSessionId;

    @Column(name = "payment_intent_id")
    private String paymentIntentId;

    @Column(name = "reserved_at", nullable = false)
    private LocalDateTime reservedAt;

    @Column(name = "confirmation_code", nullable = false, unique = true)
    private String confirmationCode;

    @Column(name = "qr_code", columnDefinition = "BYTEA")
    private byte[] qrCode;

    @Column(name = "email_sent_to")
    private String emailSentTo;
}

