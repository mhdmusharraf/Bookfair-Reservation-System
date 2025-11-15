package com.bookfair.reservation.service;

import com.bookfair.auth.entity.User;
import com.bookfair.common.service.EmailService;
import com.bookfair.common.service.QrCodeService;
import com.bookfair.reservation.dto.ReservationRequest;
import com.bookfair.reservation.dto.ReservationResponse;
import com.bookfair.reservation.entity.Reservation;
import com.bookfair.reservation.repository.ReservationRepository;
import com.bookfair.stall.entity.Stall;
import com.bookfair.stall.entity.StallStatus;
import com.bookfair.stall.repository.StallRepository;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReservationService {

    private static final int MAX_STALLS_PER_VENDOR = 3;

    private final ReservationRepository reservationRepository;
    private final StallRepository stallRepository;
    private final QrCodeService qrCodeService;
    private final EmailService emailService;

    @Transactional
    public ReservationResponse createReservation(ReservationRequest request, User user) {
        List<Reservation> existingReservations = reservationRepository.findByUser(user);
        long existingStalls = existingReservations.stream()
                .mapToLong(reservation -> reservation.getStalls().size())
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
            if (status != StallStatus.AVAILABLE) {
                throw new IllegalStateException("Stall " + stall.getCode() + " is not available");
            }
        });

        Reservation reservation = Reservation.builder()
                .user(user)
                .reservedAt(LocalDateTime.now())
                .confirmationCode(generateConfirmationCode())
                .emailSentTo(user.getEmail())
                .build();

        stalls.forEach(stall -> {
            stall.setStatus(StallStatus.BOOKED);
            reservation.getStalls().add(stall);
            stall.getReservations().add(reservation);
        });

        byte[] qrCodeBytes = qrCodeService.generateQrCode(reservation.getConfirmationCode(), 300, 300);
        reservation.setQrCode(qrCodeBytes);

        Reservation savedReservation = reservationRepository.save(reservation);

        emailService.sendReservationConfirmation(user, savedReservation, qrCodeBytes);

        log.info("Reservation {} created for user {}", savedReservation.getId(), user.getEmail());
        return toResponse(savedReservation);
    }

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
        return "RES-" + UUID.randomUUID().toString().replace("-", "").substring(0, 10).toUpperCase();
    }
}

