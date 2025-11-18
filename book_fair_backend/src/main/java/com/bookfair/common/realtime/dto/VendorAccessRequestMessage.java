package com.bookfair.common.realtime.dto;

import com.bookfair.common.constants.VendorAccessRequestStatus;
import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;

@Value
@Builder
public class VendorAccessRequestMessage {
    Long requestId;
    Long vendorId;
    String businessName;
    String email;
    String contactNumber;
    VendorAccessRequestStatus status;
    LocalDateTime createdAt;
    LocalDateTime resolvedAt;
}
