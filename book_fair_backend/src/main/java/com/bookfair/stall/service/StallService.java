package com.bookfair.stall.service;

import com.bookfair.stall.dto.StallRequest;
import com.bookfair.stall.dto.StallResponse;
import com.bookfair.stall.entity.Stall;
import com.bookfair.stall.entity.StallSize;
import com.bookfair.stall.repository.StallRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class StallService {

    private final StallRepository stallRepository;

    public List<StallResponse> getStalls(boolean availableOnly, StallSize sizeFilter) {
        List<Stall> stalls;
        if (availableOnly && sizeFilter != null) {
            stalls = stallRepository.findBySizeAndReservedFalse(sizeFilter);
        } else if (availableOnly) {
            stalls = stallRepository.findByReservedFalse();
        } else {
            stalls = stallRepository.findAll();
            if (sizeFilter != null) {
                stalls = stalls.stream()
                        .filter(stall -> stall.getSize() == sizeFilter)
                        .collect(Collectors.toList());
            }
        }

        return stalls.stream().map(this::toResponse).toList();
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
                .reserved(false)
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
        stall.setReserved(false);
        Stall saved = stallRepository.save(stall);
        return toResponse(saved);
    }

    private StallResponse toResponse(Stall stall) {
        return StallResponse.builder()
                .id(stall.getId())
                .code(stall.getCode())
                .size(stall.getSize())
                .description(stall.getDescription())
                .reserved(stall.isReserved())
                .build();
    }
}

