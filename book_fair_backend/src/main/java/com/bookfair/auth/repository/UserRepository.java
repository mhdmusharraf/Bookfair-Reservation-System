package com.bookfair.auth.repository;

import com.bookfair.auth.entity.User;
import com.bookfair.common.constants.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    @Query("select distinct u from User u join u.roles r where r = :role")
    List<User> findAllByRole(@Param("role") Role role);
}

