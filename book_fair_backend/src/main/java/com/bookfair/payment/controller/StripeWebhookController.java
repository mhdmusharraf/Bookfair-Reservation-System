package com.bookfair.payment.controller;

import com.bookfair.payment.service.PaymentService;
import com.stripe.model.Event;
import com.stripe.model.EventDataObjectDeserializer;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/payments/webhook")
@RequiredArgsConstructor
@Slf4j
public class StripeWebhookController {

    private final PaymentService paymentService;

    @Value("${stripe.webhook-secret}")
    private String endpointSecret;

    @PostMapping
    public ResponseEntity<String> handleStripeEvent(
            @RequestHeader("Stripe-Signature") String signature,
            @RequestBody String payload
    ) {
        log.error("🔥🔥🔥 WEBHOOK CONTROLLER HIT 🔥🔥🔥");

        Event event;
        try {
            event = Webhook.constructEvent(payload, signature, endpointSecret);
            log.error("🔥 Stripe event received: {}", event.getType());
        } catch (Exception e) {
            log.error("❌ Signature verification failed: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Webhook signature error: " + e.getMessage());
        }

        if ("checkout.session.completed".equals(event.getType())) {
            log.error("🔥 checkout.session.completed received");

            EventDataObjectDeserializer deserializer = event.getDataObjectDeserializer();

            // 1️⃣ Try automatic deserialization
            if (deserializer.getObject().isPresent()) {
                Object obj = deserializer.getObject().get();

                if (obj instanceof Session session) {
                    log.error("🔥 Auto-deserialized Session ID = {}", session.getId());
                    processCompletedCheckout(session);
                } else {
                    log.error("❌ Auto object is NOT a Session: {}", obj.getClass().getName());
                }

            } else {
                // 2️⃣ Fallback: Manual JSON deserialization using Gson
                String rawJson = deserializer.getRawJson();
                if (rawJson == null) rawJson = "<no json>";

                log.error("❌ Auto-deserialization failed. Raw JSON: {}", rawJson);

                try {
                    Session session = Session.GSON.fromJson(rawJson, Session.class);
                    log.error("🔥 Manually parsed Session ID = {}", session.getId());

                    processCompletedCheckout(session);

                } catch (Exception jsonEx) {
                    log.error("❌ Manual JSON parsing failed: {}", jsonEx.getMessage(), jsonEx);
                }
            }
        }

        return ResponseEntity.ok(Map.of("received", true).toString());
    }

    private void processCompletedCheckout(Session session) {
        try {
            paymentService.handleCheckoutCompleted(session);
            log.error("🔥 PaymentService.handleCheckoutCompleted() completed successfully");
        } catch (Exception e) {
            log.error("❌ Error in PaymentService: {}", e.getMessage(), e);
        }
    }
}
