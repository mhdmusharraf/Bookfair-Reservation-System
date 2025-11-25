package com.bookfair.payment.dto;

import com.bookfair.payment.entity.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {
    private Long id;
    private Long reservationId;
    private String vendorBusinessName;
    private String vendorEmail;
    private String vendorContactNumber;
    private List<String> stalls;
    private Long amount;
    private String currency;
    private PaymentStatus status;
    private LocalDateTime createdAt;
}
