package com.bookfair.employee.service;

import com.bookfair.auth.entity.User;
import com.bookfair.auth.repository.UserRepository;
import com.bookfair.common.constants.AccountStatus;
import com.bookfair.common.constants.Role;
import com.bookfair.employee.config.EmployeeSeedProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Slf4j
@Component
@RequiredArgsConstructor
public class EmployeeAccountSeeder implements CommandLineRunner {

    private final EmployeeSeedProperties properties;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (!properties.isEnabled() || properties.getAccounts().isEmpty()) {
            return;
        }

        properties.getAccounts().forEach(account -> {
            if (userRepository.existsByEmail(account.getEmail())) {
                return;
            }
            User employee = User.builder()
                    .businessName(account.getBusinessName())
                    .contactNumber(account.getContactNumber())
                    .email(account.getEmail())
                    .password(passwordEncoder.encode(account.getPassword()))
                    .createdAt(LocalDateTime.now())
                    .status(AccountStatus.ACTIVE)
                    .approvedAt(LocalDateTime.now())
                    .build();
            employee.getRoles().add(Role.EMPLOYEE);
            userRepository.save(employee);
            log.info("Seeded employee account {}", account.getEmail());
        });
    }
}
