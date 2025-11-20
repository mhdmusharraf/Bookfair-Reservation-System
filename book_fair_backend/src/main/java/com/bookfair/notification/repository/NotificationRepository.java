package com.bookfair.notification.repository;

import com.bookfair.auth.entity.User;
import com.bookfair.notification.entity.Notification;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByRecipientOrderByCreatedAtDesc(User recipient, Pageable pageable);

    long countByRecipientAndReadIsFalse(User recipient);

    Optional<Notification> findByIdAndRecipient(Long id, User recipient);

    List<Notification> findByRecipientAndReadIsFalse(User recipient);
}

