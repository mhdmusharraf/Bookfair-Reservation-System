package com.bookfair.employee.controller;

import com.bookfair.employee.dto.DashboardResponse;
import com.bookfair.employee.service.EmployeeDashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequiredArgsConstructor
@Tag(name = "Employee Dashboard")
@RequestMapping("/api/v1/employee/dashboard")
public class EmployeeDashboardController {

    private final EmployeeDashboardService dashboardService;

    @GetMapping
    @PreAuthorize("hasRole('EMPLOYEE') or hasRole('ADMIN')")
    @Operation(summary = "Get dashboard statistics for employees")
    public ResponseEntity<DashboardResponse> dashboard() {
        return ResponseEntity.ok(dashboardService.getDashboard());
    }
}

