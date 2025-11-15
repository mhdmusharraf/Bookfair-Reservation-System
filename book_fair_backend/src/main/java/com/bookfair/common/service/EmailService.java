package com.bookfair.common.service;

import com.bookfair.auth.entity.User;
import com.bookfair.reservation.entity.Reservation;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private static final DateTimeFormatter RESERVATION_DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private final JavaMailSender mailSender;

    @Value("${spring.mail.from:no-reply@bookfair.lk}")
    private String fromAddress;

    public void sendReservationConfirmation(User user, Reservation reservation, byte[] qrCodeBytes) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, qrCodeBytes != null);
            helper.setFrom(fromAddress);
            helper.setTo(user.getEmail());
            helper.setSubject("Bookfair Reservation Confirmation - " + reservation.getConfirmationCode());

            String text = String.format("Hello %s,%n%nYour reservation has been confirmed for stalls: %s.%n" +
                            "Confirmation code: %s%nPlease present the attached QR code at the entrance.%n%nRegards,%nBookfair Team",
                    user.getBusinessName(),
                    reservation.getStalls().stream().map(stall -> stall.getCode()).sorted().toList(),
                    reservation.getConfirmationCode());
            helper.setText(text);

            if (qrCodeBytes != null) {
                helper.addAttachment("reservation-qr.png", new ByteArrayResource(qrCodeBytes));
            }

            mailSender.send(message);
            log.info("Reservation confirmation email sent to {}", user.getEmail());
        } catch (MessagingException ex) {
            log.error("Failed to send reservation confirmation email", ex);
        }
    }

    public void sendReservationNotificationToEmployees(Reservation reservation, List<User> employees, byte[] qrCodeBytes) {
        if (employees == null || employees.isEmpty()) {
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, qrCodeBytes != null);
            helper.setFrom(fromAddress);
            helper.setTo(employees.stream().map(User::getEmail).distinct().toArray(String[]::new));
            helper.setSubject("New Reservation Confirmed - " + reservation.getConfirmationCode());

            String stallCodes = reservation.getStalls().stream()
                    .map(stall -> stall.getCode())
                    .sorted()
                    .collect(Collectors.joining(", "));
            if (stallCodes.isEmpty()) {
                stallCodes = "N/A";
            }

            String text = String.format("Hello Team,%n%nA new reservation has been confirmed.%n%nVendor: %s%nEmail: %s%nContact Number: %s%nStalls Reserved: %s%nReservation Time: %s%nConfirmation Code: %s%n%nThe reservation QR code is attached for verification purposes.%n%nRegards,%nBookfair Reservation System",
                    reservation.getUser().getBusinessName(),
                    reservation.getUser().getEmail(),
                    reservation.getUser().getContactNumber(),
                    stallCodes,
                    reservation.getReservedAt().format(RESERVATION_DATE_FORMATTER),
                    reservation.getConfirmationCode());

            helper.setText(text);

            if (qrCodeBytes != null) {
                helper.addAttachment("reservation-qr.png", new ByteArrayResource(qrCodeBytes));
            }

            mailSender.send(message);
            log.info("Reservation notification email sent to {} employee(s)", employees.size());
        } catch (MessagingException ex) {
            log.error("Failed to send reservation notification email to employees", ex);
        }
    }
}

