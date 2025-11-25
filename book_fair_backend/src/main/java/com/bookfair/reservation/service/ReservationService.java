package com.bookfair.reservation.service;

import com.bookfair.auth.entity.User;
import com.bookfair.auth.repository.UserRepository;
import com.bookfair.common.constants.AccountStatus;
import com.bookfair.common.constants.Role;
import com.bookfair.common.realtime.RealTimeGateway;
import com.bookfair.common.service.EmailService;
import com.bookfair.common.service.QrCodeService;
import com.bookfair.reservation.dto.ReservationRequest;
import com.bookfair.reservation.dto.ReservationResponse;
import com.bookfair.reservation.entity.Reservation;
import com.bookfair.reservation.entity.ReservationStatus;
import com.bookfair.reservation.repository.ReservationRepository;
import com.bookfair.stall.service.StallHoldService;
import com.bookfair.stall.entity.Stall;
import com.bookfair.stall.entity.StallStatus;
import com.bookfair.stall.repository.StallRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.Comparator;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReservationService {

    private static final int MAX_STALLS_PER_VENDOR = 3;

    private final ReservationRepository reservationRepository;
    private final StallRepository stallRepository;
    private final QrCodeService qrCodeService;
    private final EmailService emailService;
    private final UserRepository userRepository;
    private final StallHoldService stallHoldService;
    private final RealTimeGateway realTimeGateway;

    /* ==========================================================
     * 1. ORIGINAL CREATE RESERVATION (NO PAYMENT)
     * ========================================================== */
    @Transactional
    public ReservationResponse createReservation(ReservationRequest request, User user) {
        List<Reservation> existingReservations = reservationRepository.findByUser(user);

        if (user.getStatus() != AccountStatus.ACTIVE) {
            throw new IllegalStateException("Vendor account is pending employee approval");
        }

        long existingStalls = existingReservations.stream()
                .mapToLong(r -> r.getStalls().size())
                .sum();

        if (existingStalls + request.getStallIds().size() > MAX_STALLS_PER_VENDOR) {
            throw new IllegalStateException("Reservation limit exceeded. Maximum of 3 stalls per business");
        }

        List<Stall> stalls = stallRepository.findAllById(request.getStallIds());
        if (stalls.size() != request.getStallIds().size()) {
            throw new IllegalArgumentException("One or more stalls do not exist");
        }

        stalls.forEach(stall -> {
            StallStatus status = stall.getStatus() != null ? stall.getStatus() : StallStatus.AVAILABLE;
            if (status == StallStatus.BOOKED) {
                throw new IllegalStateException("Stall " + stall.getCode() + " is not available");
            }
            if (status == StallStatus.IN_PROGRESS
                    && stall.getHeldBy() != null
                    && !stall.getHeldBy().getId().equals(user.getId())) {
                throw new IllegalStateException("Stall " + stall.getCode() + " is being held by another vendor");
            }
        });

        Reservation reservation = Reservation.builder()
                .user(user)
                .reservedAt(LocalDateTime.now())
                .confirmationCode(generateConfirmationCode())
                .emailSentTo(user.getEmail())
                .status(ReservationStatus.PAID) // direct reservation = paid (since no payment)
                .build();

        stallHoldService.finalizeForReservation(stalls, user);

        stalls.forEach(stall -> {
            reservation.getStalls().add(stall);
            stall.getReservations().add(reservation);
        });

        byte[] qrCodeBytes = qrCodeService.generateQrCode(reservation.getConfirmationCode(), 300, 300);
        reservation.setQrCode(qrCodeBytes);

        Reservation saved = reservationRepository.save(reservation);
        ReservationResponse response = toResponse(saved);

        emailService.sendReservationConfirmation(user, saved, qrCodeBytes);

        List<User> employees = userRepository.findAllByRole(Role.EMPLOYEE);
        emailService.sendReservationNotificationToEmployees(saved, employees, qrCodeBytes);
        realTimeGateway.publishReservation(response);

        log.info("Reservation {} created for user {}", saved.getId(), user.getEmail());
        return response;
    }

    /* ==========================================================
     * 2. CREATE PENDING RESERVATION (FOR PAYMENT)
     * ========================================================== */
    @Transactional
    public Reservation createPendingReservationForPayment(
            List<Long> stallIds,
            User user,
            long totalAmountCents,
            String currency
    ) {

        if (user.getStatus() != AccountStatus.ACTIVE) {
            throw new IllegalStateException("Vendor account is pending employee approval");
        }

        List<Stall> stalls = stallRepository.findAllById(stallIds);
        if (stalls.size() != stallIds.size()) {
            throw new IllegalArgumentException("One or more stalls do not exist");
        }

        long existingStalls = reservationRepository.findByUser(user).stream()
                .mapToLong(r -> r.getStalls().size())
                .sum();

        if (existingStalls + stallIds.size() > MAX_STALLS_PER_VENDOR) {
            throw new IllegalStateException("Reservation limit exceeded. Maximum of 3 stalls per business");
        }

        stalls.forEach(stall -> {
            StallStatus status = stall.getStatus() != null ? stall.getStatus() : StallStatus.AVAILABLE;
            if (status == StallStatus.BOOKED) {
                throw new IllegalStateException("Stall " + stall.getCode() + " is not available");
            }
            if (status == StallStatus.IN_PROGRESS
                    && stall.getHeldBy() != null
                    && !stall.getHeldBy().getId().equals(user.getId())) {
                throw new IllegalStateException("Stall " + stall.getCode() + " is being held by another vendor");
            }
        });

        // HOLD stalls (not finalize)
        List<Stall> held = new ArrayList<>();
        for (Stall s : stalls) {
            held.add(stallHoldService.hold(s.getId(), user));
        }

        Reservation reservation = Reservation.builder()
                .user(user)
                .reservedAt(LocalDateTime.now())
                .confirmationCode(generateConfirmationCode())
                .emailSentTo(user.getEmail())
                .status(ReservationStatus.PENDING_PAYMENT)
                .totalAmount(totalAmountCents)
                .currency(currency)
                .build();

        for (Stall stall : held) {
            reservation.getStalls().add(stall);
            stall.getReservations().add(reservation);
        }


        reservation = reservationRepository.save(reservation);

        log.info("Created PENDING_PAYMENT reservation {} for {}", reservation.getId(), user.getEmail());
        return reservation;
    }

    /* ==========================================================
     * 3. FINALIZE PAYMENT (CALLED FROM STRIPE WEBHOOK)
     * ========================================================== */
    @Transactional
    public void finalizeReservationPayment(Long reservationId, String sessionId, String paymentIntentId) {

        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new IllegalArgumentException("Reservation not found"));

        if (reservation.getStatus() == ReservationStatus.PAID) {
            log.info("Reservation {} already PAID", reservationId);
            return;
        }

        if (reservation.getStatus() == ReservationStatus.CANCELLED) {
            throw new IllegalStateException("Reservation " + reservationId + " was cancelled and cannot be finalized");
        }

        List<Stall> stalls = new ArrayList<>(reservation.getStalls());

        stallHoldService.finalizeForReservation(stalls, reservation.getUser());

        reservation.setStatus(ReservationStatus.PAID);
        reservation.setStripeSessionId(sessionId);
        reservation.setPaymentIntentId(paymentIntentId);

        byte[] qrBytes = qrCodeService.generateQrCode(reservation.getConfirmationCode(), 300, 300);
        reservation.setQrCode(qrBytes);

        reservationRepository.save(reservation);

        emailService.sendReservationConfirmation(reservation.getUser(), reservation, qrBytes);

        List<User> employees = userRepository.findAllByRole(Role.EMPLOYEE);
        emailService.sendReservationNotificationToEmployees(reservation, employees, qrBytes);

        realTimeGateway.publishReservation(toResponse(reservation));

        log.info("Reservation {} finalized as PAID", reservationId);
    }

    /* ==========================================================
     * 4. CANCEL PENDING RESERVATION (FAILED PAYMENT)
     * ========================================================== */
    @Transactional
    public void cancelPendingReservation(Long reservationId, String paymentIntentId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new IllegalArgumentException("Reservation not found"));

        if (reservation.getStatus() == ReservationStatus.PAID) {
            log.info("Reservation {} already PAID; skipping cancel", reservationId);
            return;
        }

        reservation.setStatus(ReservationStatus.CANCELLED);
        reservation.setPaymentIntentId(paymentIntentId);

        List<Stall> stalls = new ArrayList<>(reservation.getStalls());
        for (Stall stall : stalls) {
            stallHoldService.release(stall.getId(), reservation.getUser(), true);
        }

        reservationRepository.save(reservation);
        log.info("Reservation {} cancelled and holds released", reservationId);
    }

    /* ==========================================================
     * REST OF ORIGINAL METHODS
     * ========================================================== */

    @Transactional(readOnly = true)
    public List<ReservationResponse> getReservationsForUser(User user) {
        return reservationRepository.findByUser(user).stream()
                .sorted(Comparator.comparing(Reservation::getReservedAt).reversed())
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ReservationResponse> getAllReservations() {
        return reservationRepository.findAll().stream()
                .sorted(Comparator.comparing(Reservation::getReservedAt).reversed())
                .map(this::toResponse)
                .toList();
    }

    private ReservationResponse toResponse(Reservation reservation) {
        List<String> stallCodes = reservation.getStalls().stream()
                .map(Stall::getCode)
                .sorted()
                .toList();

        return ReservationResponse.builder()
                .id(reservation.getId())
                .reservedAt(reservation.getReservedAt())
                .confirmationCode(reservation.getConfirmationCode())
                .stalls(stallCodes)
                .totalReservedStalls(stallCodes.size())
                .vendorBusinessName(reservation.getUser().getBusinessName())
                .vendorEmail(reservation.getUser().getEmail())
                .vendorContactNumber(reservation.getUser().getContactNumber())
                .build();
    }

    private String generateConfirmationCode() {
        return "RES-" + UUID.randomUUID().toString().replace("-", "")
                .substring(0, 10).toUpperCase();
    }
}
