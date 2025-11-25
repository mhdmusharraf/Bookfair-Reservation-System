package com.bookfair.auth.controller;

import com.bookfair.auth.entity.User;
import com.bookfair.auth.entity.VendorAccessRequest;
import com.bookfair.auth.service.UserService;
import com.bookfair.auth.service.VendorAccessService;
import com.bookfair.common.constants.VendorAccessRequestStatus;
import com.bookfair.common.realtime.dto.VendorAccessRequestMessage;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class VendorAccessControllerTest {

    @Mock
    private VendorAccessService vendorAccessService;

    @Mock
    private UserService userService;

    @InjectMocks
    private VendorAccessController controller;

    @Test
    void pendingRequests_mapsAndReturnsMessages() {
        User vendor = User.builder()
                .id(11L)
                .businessName("Books Co")
                .contactNumber("0111111")
                .email("vendor@books.com")
                .build();

        VendorAccessRequest req = VendorAccessRequest.builder()
                .id(100L)
                .vendor(vendor)
                .status(VendorAccessRequestStatus.PENDING)
                .createdAt(LocalDateTime.of(2025,1,1,10,0))
                .build();

        when(vendorAccessService.getPendingRequests()).thenReturn(List.of(req));

        ResponseEntity<List<VendorAccessRequestMessage>> resp = controller.pendingRequests();

        assertThat(resp.getStatusCodeValue()).isEqualTo(200);
        List<VendorAccessRequestMessage> body = resp.getBody();
        assertThat(body).hasSize(1);
        VendorAccessRequestMessage msg = body.get(0);
        assertThat(msg.getRequestId()).isEqualTo(100L);
        assertThat(msg.getVendorId()).isEqualTo(11L);
        assertThat(msg.getBusinessName()).isEqualTo("Books Co");
        assertThat(msg.getEmail()).isEqualTo("vendor@books.com");
        assertThat(msg.getStatus()).isEqualTo(VendorAccessRequestStatus.PENDING);
        assertThat(msg.getCreatedAt()).isEqualTo(LocalDateTime.of(2025,1,1,10,0));
    }

    @Test
    void approve_returnsMappedMessage() {
        User vendor = User.builder()
                .id(22L)
                .businessName("Readers Inc")
                .contactNumber("0222222")
                .email("vendor2@read.com")
                .build();

        VendorAccessRequest saved = VendorAccessRequest.builder()
                .id(200L)
                .vendor(vendor)
                .status(VendorAccessRequestStatus.APPROVED)
                .createdAt(LocalDateTime.of(2025,2,2,9,0))
                .resolvedAt(LocalDateTime.of(2025,2,2,10,0))
                .build();

        User employee = User.builder().id(99L).email("emp@org.com").build();

        when(userService.getCurrentUser()).thenReturn(employee);
        when(vendorAccessService.approve(eq(200L), eq(employee))).thenReturn(saved);

        ResponseEntity<VendorAccessRequestMessage> resp = controller.approve(200L);

        assertThat(resp.getStatusCodeValue()).isEqualTo(200);
        VendorAccessRequestMessage msg = resp.getBody();
        assertThat(msg.getRequestId()).isEqualTo(200L);
        assertThat(msg.getVendorId()).isEqualTo(22L);
        assertThat(msg.getBusinessName()).isEqualTo("Readers Inc");
        assertThat(msg.getEmail()).isEqualTo("vendor2@read.com");
        assertThat(msg.getStatus()).isEqualTo(VendorAccessRequestStatus.APPROVED);
        assertThat(msg.getResolvedAt()).isEqualTo(LocalDateTime.of(2025,2,2,10,0));
    }
}