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

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

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
                    user.getVendor().getBusinessName(),
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
}

