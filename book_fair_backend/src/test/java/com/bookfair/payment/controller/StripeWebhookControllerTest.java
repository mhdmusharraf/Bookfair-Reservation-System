package com.bookfair.payment.controller;

import com.bookfair.payment.service.PaymentService;
import com.stripe.model.Event;
import com.stripe.model.EventDataObjectDeserializer;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.lang.reflect.Field;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StripeWebhookControllerTest {

    @Mock
    private PaymentService paymentService;

    @InjectMocks
    private StripeWebhookController controller;

    @Test
    void handleStripeEvent_signatureVerificationFails_returnsBadRequest() throws Exception {
        String payload = "{}";
        String signature = "sig_header";

        // set endpointSecret via reflection
        Field f = StripeWebhookController.class.getDeclaredField("endpointSecret");
        f.setAccessible(true);
        f.set(controller, "secret");

        try (MockedStatic<Webhook> mocked = mockStatic(Webhook.class)) {
            mocked.when(() -> Webhook.constructEvent(payload, signature, "secret"))
                    .thenThrow(new RuntimeException("invalid signature"));

            ResponseEntity<String> resp = controller.handleStripeEvent(signature, payload);

            assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
            assertThat(resp.getBody()).contains("Webhook signature error");
        }
    }

    @Test
    void handleStripeEvent_checkoutSessionCompleted_callsPaymentService() throws Exception {
        String payload = "{}";
        String signature = "sig_header";

        Field f = StripeWebhookController.class.getDeclaredField("endpointSecret");
        f.setAccessible(true);
        f.set(controller, "secret");

        Event eventMock = mock(Event.class);
        when(eventMock.getType()).thenReturn("checkout.session.completed");

        EventDataObjectDeserializer deserializer = mock(EventDataObjectDeserializer.class);
        Session sessionMock = mock(Session.class);
        when(sessionMock.getId()).thenReturn("sess_1");

        when(deserializer.getObject()).thenReturn(Optional.of((com.stripe.model.StripeObject) sessionMock));
        when(eventMock.getDataObjectDeserializer()).thenReturn(deserializer);

        try (MockedStatic<Webhook> mocked = mockStatic(Webhook.class)) {
            mocked.when(() -> Webhook.constructEvent(payload, signature, "secret"))
                    .thenReturn(eventMock);

            ResponseEntity<String> resp = controller.handleStripeEvent(signature, payload);

            assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
            verify(paymentService, times(1)).handleCheckoutCompleted(eq(sessionMock));
            assertThat(resp.getBody()).contains("received");
        }
    }
}