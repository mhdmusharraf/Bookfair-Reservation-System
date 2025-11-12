package com.bookfair.reservation.repository;

import com.bookfair.auth.entity.User;
import com.bookfair.reservation.entity.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    List<Reservation> findByUser(User user);
}

