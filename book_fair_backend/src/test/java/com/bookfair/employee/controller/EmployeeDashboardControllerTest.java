package com.bookfair.employee.controller;

import com.bookfair.employee.dto.DashboardResponse;
import com.bookfair.employee.service.EmployeeDashboardService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EmployeeDashboardControllerTest {

    @Mock
    private EmployeeDashboardService dashboardService;

    @InjectMocks
    private EmployeeDashboardController controller;

    @Test
    void dashboard_returnsDashboardResponseFromService() {
        DashboardResponse expected = DashboardResponse.builder()
                .totalStalls(50)
                .availableStalls(20)
                .reservedStalls(30)
                .totalReservations(120)
                .build();

        when(dashboardService.getDashboard()).thenReturn(expected);

        ResponseEntity<DashboardResponse> resp = controller.dashboard();

        assertThat(resp.getStatusCodeValue()).isEqualTo(200);
        DashboardResponse body = resp.getBody();
        assertThat(body).isEqualTo(expected);
    }
}