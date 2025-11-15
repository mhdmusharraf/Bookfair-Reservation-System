package com.bookfair.stall.repository;

import com.bookfair.stall.entity.Stall;
import com.bookfair.stall.entity.StallSize;
import com.bookfair.stall.entity.StallStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StallRepository extends JpaRepository<Stall, Long> {

    List<Stall> findByStatus(StallStatus status);

    List<Stall> findBySizeAndStatus(StallSize size, StallStatus status);

    long countByStatus(StallStatus status);

    Optional<Stall> findByCode(String code);
}

