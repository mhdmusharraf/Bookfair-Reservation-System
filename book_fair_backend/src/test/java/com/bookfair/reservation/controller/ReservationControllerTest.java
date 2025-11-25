package com.bookfair.reservation.controller;

import com.bookfair.auth.entity.User;
import com.bookfair.auth.service.UserService;
import com.bookfair.reservation.dto.ReservationRequest;
import com.bookfair.reservation.dto.ReservationResponse;
import com.bookfair.reservation.service.ReservationService;
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
class ReservationControllerTest {

    @Mock
    private ReservationService reservationService;

    @Mock
    private UserService userService;

    @InjectMocks
    private com.bookfair.reservation.controller.ReservationController controller;

    @Test
    void createReservation_returnsCreatedReservation() {
        User user = User.builder().id(50L).email("vendor@ex.com").build();
        when(userService.getCurrentUser()).thenReturn(user);

        ReservationRequest req = new ReservationRequest();
        req.setStallIds(List.of(1L, 2L));

        ReservationResponse resp = ReservationResponse.builder()
                .id(123L)
                .reservedAt(LocalDateTime.of(2025,5,10,12,30))
                .confirmationCode("RES-123")
                .stall("S1")
                .stall("S2")
                .totalReservedStalls(2)
                .vendorBusinessName("VendorCo")
                .vendorEmail("v@co.com")
                .vendorContactNumber("0111")
                .build();

        when(reservationService.createReservation(eq(req), eq(user))).thenReturn(resp);

        ResponseEntity<ReservationResponse> result = controller.createReservation(req);

        assertThat(result.getStatusCodeValue()).isEqualTo(200);
        assertThat(result.getBody()).isEqualTo(resp);
    }

    @Test
    void myReservations_returnsListForUser() {
        User user = User.builder().id(51L).email("vendor2@ex.com").build();
        when(userService.getCurrentUser()).thenReturn(user);

        ReservationResponse r1 = ReservationResponse.builder().id(1L).confirmationCode("A").reservedAt(LocalDateTime.now()).stall("S1").totalReservedStalls(1).vendorBusinessName("V").vendorEmail("e").vendorContactNumber("c").build();
        when(reservationService.getReservationsForUser(eq(user))).thenReturn(List.of(r1));

        ResponseEntity<List<ReservationResponse>> resp = controller.myReservations();

        assertThat(resp.getStatusCodeValue()).isEqualTo(200);
        assertThat(resp.getBody()).containsExactly(r1);
    }

    @Test
    void allReservations_returnsAll() {
        ReservationResponse r = ReservationResponse.builder().id(2L).confirmationCode("B").reservedAt(LocalDateTime.now()).stall("S2").totalReservedStalls(1).vendorBusinessName("V2").vendorEmail("e2").vendorContactNumber("c2").build();
        when(reservationService.getAllReservations()).thenReturn(List.of(r));

        ResponseEntity<List<ReservationResponse>> resp = controller.allReservations();

        assertThat(resp.getStatusCodeValue()).isEqualTo(200);
        assertThat(resp.getBody()).containsExactly(r);
    }
}
