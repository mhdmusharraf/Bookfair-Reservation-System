package com.bookfair.reservation.repository;

import com.bookfair.auth.entity.User;
import com.bookfair.reservation.entity.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import org.springframework.data.jpa.repository.EntityGraph;
import java.util.Optional;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    List<Reservation> findByUser(User user);


    @EntityGraph(attributePaths = "stalls")
    Optional<Reservation> findWithStallsById(Long id);
}

