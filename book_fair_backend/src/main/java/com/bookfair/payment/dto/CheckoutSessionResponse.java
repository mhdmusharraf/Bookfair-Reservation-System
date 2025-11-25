package com.bookfair.payment.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CheckoutSessionResponse {
    private String checkoutUrl;
    private String sessionId;
}
