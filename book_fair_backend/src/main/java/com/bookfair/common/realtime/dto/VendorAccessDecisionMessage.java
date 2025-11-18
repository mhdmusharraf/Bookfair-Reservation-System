package com.bookfair.common.realtime.dto;

import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;

@Value
@Builder
public class VendorAccessDecisionMessage {
    Long vendorId;
    String decision;
    LocalDateTime decidedAt;
    String decidedBy;
}
