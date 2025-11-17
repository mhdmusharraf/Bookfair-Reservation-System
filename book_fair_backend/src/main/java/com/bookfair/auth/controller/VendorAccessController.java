package com.bookfair.auth.controller;

import com.bookfair.auth.entity.User;
import com.bookfair.auth.entity.VendorAccessRequest;
import com.bookfair.auth.service.UserService;
import com.bookfair.auth.service.VendorAccessService;
import com.bookfair.common.realtime.dto.VendorAccessRequestMessage;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Tag(name = "Vendor Access")
@RequestMapping("/api/v1/vendor-access")
public class VendorAccessController {

    private final VendorAccessService vendorAccessService;
    private final UserService userService;

    @GetMapping("/requests")
    @PreAuthorize("hasRole('EMPLOYEE') or hasRole('ADMIN')")
    @Operation(summary = "List vendor access requests awaiting approval")
    public ResponseEntity<List<VendorAccessRequestMessage>> pendingRequests() {
        List<VendorAccessRequestMessage> payload = vendorAccessService.getPendingRequests().stream()
                .map(this::toMessage)
                .toList();
        return ResponseEntity.ok(payload);
    }

    @PostMapping("/requests/{id}/approve")
    @PreAuthorize("hasRole('EMPLOYEE') or hasRole('ADMIN')")
    @Operation(summary = "Approve a vendor login request")
    public ResponseEntity<VendorAccessRequestMessage> approve(@PathVariable Long id) {
        User employee = userService.getCurrentUser();
        VendorAccessRequest request = vendorAccessService.approve(id, employee);
        return ResponseEntity.ok(toMessage(request));
    }

    private VendorAccessRequestMessage toMessage(VendorAccessRequest request) {
        return VendorAccessRequestMessage.builder()
                .requestId(request.getId())
                .vendorId(request.getVendor().getId())
                .businessName(request.getVendor().getBusinessName())
                .email(request.getVendor().getEmail())
                .contactNumber(request.getVendor().getContactNumber())
                .status(request.getStatus())
                .createdAt(request.getCreatedAt())
                .resolvedAt(request.getResolvedAt())
                .build();
    }
}
