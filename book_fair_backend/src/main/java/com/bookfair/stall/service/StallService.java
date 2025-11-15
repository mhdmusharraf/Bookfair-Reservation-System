package com.bookfair.stall.service;

import com.bookfair.stall.dto.StallCollectionResponse;
import com.bookfair.stall.dto.StallRequest;
import com.bookfair.stall.dto.StallResponse;
import com.bookfair.stall.entity.Stall;
import com.bookfair.stall.entity.StallSize;
import com.bookfair.stall.entity.StallStatus;
import com.bookfair.stall.repository.StallRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class StallService {

    private final StallRepository stallRepository;

    public StallCollectionResponse getStalls(boolean availableOnly, StallSize sizeFilter) {
        List<Stall> allStalls = stallRepository.findAll();

        List<Stall> filtered = allStalls.stream()
                .filter(stall -> {
                    StallStatus status = resolveStatus(stall);
                    return !availableOnly || status == StallStatus.AVAILABLE;
                })
                .filter(stall -> sizeFilter == null || stall.getSize() == sizeFilter)
                .sorted(Comparator.comparing(Stall::getCode, Comparator.nullsLast(String::compareToIgnoreCase)))
                .toList();

        List<Long> bookedIds = allStalls.stream()
                .filter(stall -> resolveStatus(stall) == StallStatus.BOOKED)
                .map(Stall::getId)
                .toList();

        List<Long> inProgressIds = allStalls.stream()
                .filter(stall -> resolveStatus(stall) == StallStatus.IN_PROGRESS)
                .map(Stall::getId)
                .toList();

        return StallCollectionResponse.builder()
                .stalls(filtered.stream().map(this::toResponse).toList())
                .bookedIds(bookedIds)
                .inProgressIds(inProgressIds)
                .build();
    }

    @Transactional
    public StallResponse createStall(StallRequest request) {
        stallRepository.findByCode(request.getCode()).ifPresent(stall -> {
            throw new IllegalArgumentException("Stall code already exists");
        });

        Stall stall = Stall.builder()
                .code(request.getCode().toUpperCase())
                .size(request.getSize())
                .description(request.getDescription())
                .status(StallStatus.AVAILABLE)
                .build();

        Stall saved = stallRepository.save(stall);
        log.info("Created new stall {}", saved.getCode());
        return toResponse(saved);
    }

    @Transactional
    public StallResponse releaseStall(Long id) {
        Stall stall = stallRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Stall not found"));
        stall.getReservations().forEach(reservation -> reservation.getStalls().remove(stall));
        stall.getReservations().clear();
        stall.setStatus(StallStatus.AVAILABLE);
        Stall saved = stallRepository.save(stall);
        return toResponse(saved);
    }

    private StallResponse toResponse(Stall stall) {
        StallStatus status = resolveStatus(stall);
        return StallResponse.builder()
                .id(stall.getId())
                .code(stall.getCode())
                .size(stall.getSize())
                .description(stall.getDescription())
                .status(status)
                .reserved(status == StallStatus.BOOKED)
                .build();
    }

    private StallStatus resolveStatus(Stall stall) {
        return stall.getStatus() != null ? stall.getStatus() : StallStatus.AVAILABLE;
    }
}

