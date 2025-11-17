package com.bookfair.auth.dto;

import com.bookfair.common.constants.Role;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;
import java.util.Set;

@Value
@Builder
public class UserProfileResponse {

    Long userId;
    String email;
    String role;
    Boolean isActive;

    // Vendor-specific (null if EMPLOYEE)
    Long vendorId;
    String businessName;
    String phone;
    String address;

    // Employee-specific (null if VENDOR)
    Long employeeId;
    String fullName;
    String department;
    String employeePhone;
}

