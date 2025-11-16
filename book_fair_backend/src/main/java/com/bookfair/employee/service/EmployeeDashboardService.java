package com.bookfair.employee.service;

import com.bookfair.employee.dto.DashboardResponse;
import com.bookfair.reservation.repository.ReservationRepository;
import com.bookfair.stall.entity.StallStatus;
import com.bookfair.stall.repository.StallRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmployeeDashboardService {

    private final StallRepository stallRepository;
    private final ReservationRepository reservationRepository;

    public DashboardResponse getDashboard() {
        long totalStalls = stallRepository.count();
        long availableStalls = stallRepository.countByStatus(StallStatus.AVAILABLE);
        long reservedStalls = stallRepository.countByStatus(StallStatus.BOOKED);
        long totalReservations = reservationRepository.count();

        return DashboardResponse.builder()
                .totalStalls(totalStalls)
                .availableStalls(availableStalls)
                .reservedStalls(reservedStalls)
                .totalReservations(totalReservations)
                .build();
    }
}

