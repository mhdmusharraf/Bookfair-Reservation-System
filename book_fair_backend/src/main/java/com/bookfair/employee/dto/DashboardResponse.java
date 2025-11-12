package com.bookfair.employee.dto;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class DashboardResponse {

    long totalStalls;

    long availableStalls;

    long reservedStalls;

    long totalReservations;
}

