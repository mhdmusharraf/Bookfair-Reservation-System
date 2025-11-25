package com.bookfair.payment.service;

import com.bookfair.auth.entity.User;
import com.bookfair.auth.repository.UserRepository;
import com.bookfair.auth.service.UserService;
import com.bookfair.common.realtime.RealTimeGateway;
import com.bookfair.payment.dto.CheckoutSessionResponse;
import com.bookfair.payment.dto.PaymentResponse;
import com.bookfair.payment.entity.Payment;
import com.bookfair.payment.entity.PaymentStatus;
import com.bookfair.payment.repository.PaymentRepository;
import com.bookfair.notification.service.NotificationService;
import com.bookfair.reservation.entity.Reservation;
import com.bookfair.reservation.repository.ReservationRepository;
import com.bookfair.reservation.service.ReservationService;
import com.bookfair.stall.entity.Stall;
import com.bookfair.stall.repository.StallRepository;
import com.stripe.Stripe;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import jakarta.annotation.PostConstruct;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import com.bookfair.stall.entity.StallSize;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final ReservationService reservationService;
    private final ReservationRepository reservationRepository;
    private final PaymentRepository paymentRepository;
    private final UserService userService; // to get current user when needed
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final RealTimeGateway realTimeGateway;
    private final StallRepository stallRepository;

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
        if (stallIds == null || stallIds.isEmpty()) {
            throw new IllegalArgumentException("No stalls provided for payment");
        }
        Map<StallSize, Integer> sizePricing = Map.of(
                StallSize.SMALL, 40000,
                StallSize.MEDIUM, 70000,
                StallSize.LARGE, 100000
        );
        List<Stall> stalls = stallRepository.findAllById(stallIds);
        if (stalls.size() != stallIds.size()) {
            throw new IllegalArgumentException("One or more stalls could not be priced");
        }
        long total = 0L;
        for (Stall stall : stalls) {
            Integer price = sizePricing.getOrDefault(stall.getSize(), 40000);
            total += price * 100L; // store in cents for Stripe
        }
        return total;
    }

    /**
     * Handle checkout.session.completed events
     */
    @Transactional
    public void handleCheckoutCompleted(Session session) {
        String sessionId = session.getId();
        String reservationIdStr = session.getMetadata().get("reservationId");
        String userIdStr = session.getMetadata().get("userId");
        String paymentIntentId = session.getPaymentIntent();

        if (reservationIdStr == null) {
            log.warn("Stripe session {} missing reservationId metadata", sessionId);
            return;
        }
        Long reservationId = Long.valueOf(reservationIdStr);

        Payment payment = paymentRepository.findByStripeSessionId(sessionId).orElse(null);
        if (payment != null) {
            payment.setPaymentIntentId(paymentIntentId);
            payment.setStatus(PaymentStatus.SUCCEEDED);
            paymentRepository.save(payment);
        }

        // finalize reservation (book stalls, generate QR & send email)
        reservationService.finalizeReservationPayment(reservationId, sessionId, paymentIntentId);

        User vendor = null;
        if (payment != null && payment.getUserId() != null) {
            vendor = userRepository.findById(payment.getUserId()).orElse(null);
        } else if (userIdStr != null) {
            vendor = userRepository.findById(Long.valueOf(userIdStr)).orElse(null);
        }

        PaymentResponse response = payment != null ? toResponse(payment) : null;
        if (response != null) {
            realTimeGateway.publishPayment(response);
        }

        if (vendor != null && payment != null) {
            String formattedAmount = String.format(Locale.US, "%.2f %s", payment.getAmount() / 100.0,
                    Optional.ofNullable(payment.getCurrency()).orElse("USD").toUpperCase());
            notificationService.notifyEmployeesOfPayment(vendor, formattedAmount);
        }
    }

    public List<PaymentResponse> getAllPayments() {
        return paymentRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private PaymentResponse toResponse(Payment payment) {
        User vendor = Optional.ofNullable(payment.getUserId())
                .flatMap(userRepository::findById)
                .orElse(null);
        Reservation reservation = Optional.ofNullable(payment.getReservationId())
                .flatMap(reservationRepository::findById)
                .orElse(null);

        List<String> stallCodes = reservation == null
                ? List.of()
                : reservation.getStalls().stream()
                .map(Stall::getCode)
                .filter(Objects::nonNull)
                .sorted()
                .toList();

        return PaymentResponse.builder()
                .id(payment.getId())
                .reservationId(payment.getReservationId())
                .vendorBusinessName(Optional.ofNullable(vendor).map(User::getBusinessName).orElse(null))
                .vendorEmail(Optional.ofNullable(vendor).map(User::getEmail).orElse(null))
                .vendorContactNumber(Optional.ofNullable(vendor).map(User::getContactNumber).orElse(null))
                .stalls(stallCodes)
                .amount(payment.getAmount())
                .currency(payment.getCurrency())
                .status(payment.getStatus())
                .createdAt(payment.getCreatedAt())
                .build();
    }
}
