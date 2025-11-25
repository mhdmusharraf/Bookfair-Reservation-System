package com.bookfair.payment.controller;

import com.bookfair.auth.entity.User;
import com.bookfair.auth.service.UserService;
import com.bookfair.payment.dto.CheckoutSessionResponse;
import com.bookfair.payment.dto.CreateCheckoutSessionRequest;
import com.bookfair.payment.dto.PaymentResponse;
import com.bookfair.payment.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final UserService userService;

    @PostMapping("/create-checkout-session")
    @PreAuthorize("hasRole('VENDOR')")
    @Operation(summary = "Create Stripe Checkout session for reservation payment")
    public ResponseEntity<CheckoutSessionResponse> createCheckoutSession(@RequestBody CreateCheckoutSessionRequest request) throws Exception {
        User user = userService.getCurrentUser();
        CheckoutSessionResponse resp = paymentService.createCheckoutSession(request.getStallIds(), user, request.getCurrency());
        return ResponseEntity.ok(resp);
    }

    @GetMapping
    @PreAuthorize("hasRole('EMPLOYEE') or hasRole('ADMIN')")
    @Operation(summary = "List all payments")
    public ResponseEntity<List<PaymentResponse>> listPayments() {
        return ResponseEntity.ok(paymentService.getAllPayments());
    }
}
