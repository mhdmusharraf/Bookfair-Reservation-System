package com.bookfair.common.realtime.dto;

import com.bookfair.stall.entity.StallStatus;
import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;

@Value
@Builder
public class StallStatusMessage {
    Long stallId;
    String stallCode;
    StallStatus status;
    Long heldByVendorId;
    String heldByBusinessName;
    LocalDateTime holdExpiresAt;
}
