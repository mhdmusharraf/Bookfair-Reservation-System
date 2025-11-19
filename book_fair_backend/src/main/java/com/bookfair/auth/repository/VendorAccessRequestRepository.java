package com.bookfair.auth.repository;

import com.bookfair.auth.entity.User;
import com.bookfair.auth.entity.VendorAccessRequest;
import com.bookfair.common.constants.VendorAccessRequestStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface VendorAccessRequestRepository extends JpaRepository<VendorAccessRequest, Long> {

    Optional<VendorAccessRequest> findFirstByVendorAndStatusOrderByCreatedAtDesc(User vendor, VendorAccessRequestStatus status);

    @EntityGraph(attributePaths = {"vendor"})
    List<VendorAccessRequest> findByStatusOrderByCreatedAtAsc(VendorAccessRequestStatus status);
}
