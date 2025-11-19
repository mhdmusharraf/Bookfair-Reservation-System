package com.bookfair.auth.service;

import com.bookfair.auth.entity.User;
import com.bookfair.auth.entity.VendorAccessRequest;
import com.bookfair.auth.repository.UserRepository;
import com.bookfair.auth.repository.VendorAccessRequestRepository;
import com.bookfair.common.constants.AccountStatus;
import com.bookfair.common.constants.VendorAccessRequestStatus;
import com.bookfair.common.realtime.RealTimeGateway;
//import jakarta.transaction.Transactional;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class VendorAccessService {

    private final VendorAccessRequestRepository requestRepository;
    private final UserRepository userRepository;
    private final RealTimeGateway realTimeGateway;

    @Transactional
    public VendorAccessRequest ensurePendingRequest(User vendor, String actor) {
        VendorAccessRequest existing = requestRepository
                .findFirstByVendorAndStatusOrderByCreatedAtDesc(vendor, VendorAccessRequestStatus.PENDING)
                .orElse(null);
        if (existing != null) {
            existing.setLastUpdatedBy(actor);
            VendorAccessRequest saved = requestRepository.save(existing);
            realTimeGateway.publishVendorAccessRequest(saved);
            return saved;
        }

        VendorAccessRequest request = VendorAccessRequest.builder()
                .vendor(vendor)
                .status(VendorAccessRequestStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .lastUpdatedBy(actor)
                .build();
        VendorAccessRequest saved = requestRepository.save(request);
        realTimeGateway.publishVendorAccessRequest(saved);
        return saved;
    }

    @Transactional(readOnly = true)
    public List<VendorAccessRequest> getPendingRequests() {
        return requestRepository.findByStatusOrderByCreatedAtAsc(VendorAccessRequestStatus.PENDING);
    }

    @Transactional
    public VendorAccessRequest approve(Long requestId, User employee) {
        VendorAccessRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Request not found"));

        if (request.getStatus() == VendorAccessRequestStatus.APPROVED) {
            return request;
        }

        request.setStatus(VendorAccessRequestStatus.APPROVED);
        request.setResolvedAt(LocalDateTime.now());
        request.setLastUpdatedBy(employee.getEmail());

        User vendor = request.getVendor();
        vendor.setStatus(AccountStatus.ACTIVE);
        vendor.setApprovedAt(LocalDateTime.now());
        userRepository.save(vendor);

        VendorAccessRequest saved = requestRepository.save(request);
        realTimeGateway.publishVendorAccessRequest(saved);
        realTimeGateway.publishVendorDecision(vendor, "APPROVED", employee.getEmail());
        return saved;
    }
}
