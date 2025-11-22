package com.bookfair.payment.service;

import com.bookfair.payment.dto.CheckoutSessionResponse;
import com.bookfair.payment.entity.Payment;
import com.bookfair.payment.entity.PaymentStatus;
import com.bookfair.payment.repository.PaymentRepository;
import com.bookfair.reservation.entity.Reservation;
import com.bookfair.reservation.repository.ReservationRepository;
import com.bookfair.reservation.service.ReservationService;
import com.bookfair.auth.entity.User;
import com.bookfair.auth.service.UserService;
import com.stripe.Stripe;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import jakarta.annotation.PostConstruct;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;

import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final ReservationService reservationService;
    private final ReservationRepository reservationRepository;
    private final PaymentRepository paymentRepository;
    private final UserService userService; // to get current user when needed

    @Value("${stripe.api-key}")
    private String stripeApiKey;

    @Value("${stripe.success-url}")
    private String successUrl;

    @Value("${stripe.cancel-url}")
    private String cancelUrl;

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeApiKey;
    }

    /**
     * Create a Checkout session for the reservation flow.
     * Steps:
     *  - validate input
     *  - create pending reservation (holds stalls)
     *  - create Stripe session (line items = total amount)
     *  - save Payment entity (status=PENDING)
     *  - return session url + id
     */
    public CheckoutSessionResponse createCheckoutSession(List<Long> stallIds, User user, String currency) throws Exception {
        // compute total amount in cents -- implement price logic (per stall price etc). Example: fixed price per stall.
        long totalAmountCents = calculateTotal(stallIds);

        // create pending reservation
        Reservation reservation = reservationService.createPendingReservationForPayment(stallIds, user, totalAmountCents, currency);

        // build Stripe session
        SessionCreateParams.LineItem.PriceData.ProductData productData =
                SessionCreateParams.LineItem.PriceData.ProductData.builder()
                        .setName("Bookfair Stall Reservation")
                        .build();

        SessionCreateParams.LineItem.PriceData priceData =
                SessionCreateParams.LineItem.PriceData.builder()
                        .setCurrency(currency)
                        .setUnitAmount(totalAmountCents)
                        .setProductData(productData)
                        .build();

        SessionCreateParams.LineItem lineItem =
                SessionCreateParams.LineItem.builder()
                        .setPriceData(priceData)
                        .setQuantity(1L)
                        .build();

        SessionCreateParams params = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl(successUrl.replace("{CHECKOUT_SESSION_ID}", "{CHECKOUT_SESSION_ID}"))
                .setCancelUrl(cancelUrl)
                .addAllLineItem(Arrays.asList(lineItem))
                // include metadata for webhook: reservationId
                .putMetadata("reservationId", String.valueOf(reservation.getId()))
                .putMetadata("userId", String.valueOf(user.getId()))
                .build();

        Session session = Session.create(params);

        // save payment record
        Payment payment = Payment.builder()
                .reservationId(reservation.getId())
                .userId(user.getId())
                .stripeSessionId(session.getId())
                .amount(totalAmountCents)
                .currency(currency)
                .status(PaymentStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();
        paymentRepository.save(payment);

        // link session id to reservation for lookup
        reservation.setStripeSessionId(session.getId());
        reservationRepository.save(reservation);

        return CheckoutSessionResponse.builder()
                .checkoutUrl(session.getUrl())
                .sessionId(session.getId())
                .build();
    }

    private long calculateTotal(List<Long> stallIds) {
        // TODO: implement your pricing logic (flat fee, per size price, etc.)
        // Example: 20 USD per stall:
        int perStallCents = 2000;
        return perStallCents * stallIds.size();
    }

    /**
     * Handle checkout.session.completed events
     */
    @Transactional
    public void handleCheckoutCompleted(Session session) {
        String sessionId = session.getId();
        String reservationIdStr = session.getMetadata().get("reservationId");
        String paymentIntentId = session.getPaymentIntent();

        if (reservationIdStr == null) {
            log.warn("Stripe session {} missing reservationId metadata", sessionId);
            return;
        }
        Long reservationId = Long.valueOf(reservationIdStr);

        // mark payment record
        paymentRepository.findByStripeSessionId(sessionId).ifPresent(payment -> {
            payment.setPaymentIntentId(paymentIntentId);
            payment.setStatus(PaymentStatus.SUCCEEDED);
            paymentRepository.save(payment);
        });

        // finalize reservation (book stalls, generate QR & send email)
        reservationService.finalizeReservationPayment(reservationId, sessionId, paymentIntentId);
    }
}
