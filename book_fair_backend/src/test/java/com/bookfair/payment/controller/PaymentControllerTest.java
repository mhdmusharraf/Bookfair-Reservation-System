package com.bookfair.payment.controller;

import com.bookfair.auth.entity.User;
import com.bookfair.auth.service.UserService;
import com.bookfair.payment.dto.CheckoutSessionResponse;
import com.bookfair.payment.dto.CreateCheckoutSessionRequest;
import com.bookfair.payment.dto.PaymentResponse;
import com.bookfair.payment.entity.PaymentStatus;
import com.bookfair.payment.service.PaymentService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PaymentControllerTest {

    @Mock
    private PaymentService paymentService;

    @Mock
    private UserService userService;

    @InjectMocks
    private com.bookfair.payment.controller.PaymentController controller;

    @Test
    void createCheckoutSession_callsServiceAndReturnsResponse() throws Exception {
        User user = User.builder().id(33L).email("vendor@ex.com").build();
        when(userService.getCurrentUser()).thenReturn(user);

        CreateCheckoutSessionRequest req = new CreateCheckoutSessionRequest(List.of(1L,2L), null, "usd");

        CheckoutSessionResponse respDto = CheckoutSessionResponse.builder()
                .checkoutUrl("https://checkout.stripe/xyz")
                .sessionId("sess_123")
                .build();

        when(paymentService.createCheckoutSession(eq(req.getStallIds()), eq(user), eq(req.getCurrency())))
                .thenReturn(respDto);

        ResponseEntity<CheckoutSessionResponse> resp = controller.createCheckoutSession(req);

        assertThat(resp.getStatusCodeValue()).isEqualTo(200);
        assertThat(resp.getBody()).isEqualTo(respDto);
    }

    @Test
    void listPayments_returnsAllPayments() {
        PaymentResponse p = PaymentResponse.builder()
                .id(5L)
                .reservationId(9L)
                .vendorBusinessName("VB")
                .vendorEmail("v@b.com")
                .vendorContactNumber("0111")
                .stalls(List.of("S1"))
                .amount(1000L)
                .currency("usd")
                .status(PaymentStatus.SUCCEEDED)
                .createdAt(LocalDateTime.now())
                .build();

        when(paymentService.getAllPayments()).thenReturn(List.of(p));

        ResponseEntity<List<PaymentResponse>> resp = controller.listPayments();

        assertThat(resp.getStatusCodeValue()).isEqualTo(200);
        assertThat(resp.getBody()).containsExactly(p);
    }
}