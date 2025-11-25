package com.bookfair.auth.repository;

import com.bookfair.auth.entity.RefreshToken;
import com.bookfair.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByToken(String token);

    void deleteByUserAndExpiresAtBefore(User user, LocalDateTime cutoff);
}
