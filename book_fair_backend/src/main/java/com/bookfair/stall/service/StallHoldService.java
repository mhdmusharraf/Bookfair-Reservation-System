package com.bookfair.stall.service;

import com.bookfair.auth.entity.User;
import com.bookfair.common.constants.AccountStatus;
import com.bookfair.common.realtime.RealTimeGateway;
import com.bookfair.stall.entity.Stall;
import com.bookfair.stall.entity.StallStatus;
import com.bookfair.stall.repository.StallRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StallHoldService {

    private final StallRepository stallRepository;
    private final RealTimeGateway realTimeGateway;

    @Value("${bookfair.stalls.hold-duration-minutes:10}")
    private long holdDurationMinutes;

    @Transactional
    public Stall hold(Long stallId, User user) {
        Stall stall = stallRepository.findById(stallId)
                .orElseThrow(() -> new IllegalArgumentException("Stall not found"));

        ensureVendorIsActive(user);

        if (stall.getStatus() == StallStatus.BOOKED) {
            throw new IllegalStateException("Stall is already booked");
        }

        if (stall.getStatus() == StallStatus.IN_PROGRESS && stall.getHeldBy() != null && !stall.getHeldBy().getId().equals(user.getId())) {
            throw new IllegalStateException("Stall is already being held by another vendor");
        }

        stall.setStatus(StallStatus.IN_PROGRESS);
        stall.setHeldBy(user);
        stall.setHoldExpiresAt(LocalDateTime.now().plusMinutes(holdDurationMinutes));
        Stall saved = stallRepository.save(stall);
        realTimeGateway.publishStallStatus(saved);
        return saved;
    }

    @Transactional
    public void release(Long stallId, User user, boolean force) {
        Stall stall = stallRepository.findById(stallId)
                .orElseThrow(() -> new IllegalArgumentException("Stall not found"));

        ensureVendorIsActive(user);

        if (!force && stall.getHeldBy() != null && !stall.getHeldBy().getId().equals(user.getId())) {
            throw new IllegalStateException("You cannot release another vendor's hold");
        }

        if (stall.getStatus() == StallStatus.BOOKED) {
            return;
        }

        stall.setStatus(StallStatus.AVAILABLE);
        stall.setHeldBy(null);
        stall.setHoldExpiresAt(null);
        realTimeGateway.publishStallStatus(stallRepository.save(stall));
    }

    @Transactional
    public void releaseAllForUser(User user) {
        if (user.getStatus() != AccountStatus.ACTIVE) {
            return;
        }
        List<Stall> held = stallRepository.findAll().stream()
                .filter(stall -> stall.getHeldBy() != null && stall.getHeldBy().getId().equals(user.getId()))
                .toList();
        held.forEach(stall -> release(stall.getId(), user, true));
    }

    @Transactional
    public void finalizeForReservation(List<Stall> stalls, User user) {
        ensureVendorIsActive(user);
        for (Stall stall : stalls) {
            if (stall.getStatus() == StallStatus.IN_PROGRESS && stall.getHeldBy() != null && !stall.getHeldBy().getId().equals(user.getId())) {
                throw new IllegalStateException("Stall " + stall.getCode() + " is being held by another vendor");
            }
            stall.setStatus(StallStatus.BOOKED);
            stall.setHeldBy(null);
            stall.setHoldExpiresAt(null);
            realTimeGateway.publishStallStatus(stall);
        }
        stallRepository.saveAll(stalls);
    }

    private void ensureVendorIsActive(User user) {
        if (user.getStatus() != AccountStatus.ACTIVE) {
            throw new IllegalStateException("Vendor account is pending employee approval");
        }
    }
}
