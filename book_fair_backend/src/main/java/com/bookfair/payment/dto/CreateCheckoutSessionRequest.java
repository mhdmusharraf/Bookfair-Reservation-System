package com.bookfair.payment.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateCheckoutSessionRequest {
    private List<Long> stallIds;
    private Long vendorId; // optional, server can get current user
    private String currency = "usd";
}
