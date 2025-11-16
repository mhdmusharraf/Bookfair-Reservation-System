package com.bookfair.auth.service;

import com.bookfair.auth.dto.AuthRequest;
import com.bookfair.auth.dto.RegisterRequest;
import com.bookfair.auth.dto.AuthResponse;
import com.bookfair.auth.dto.UserProfileResponse;
import com.bookfair.auth.entity.Vendor;
import com.bookfair.common.constants.Role;
import com.bookfair.auth.entity.User;
import com.bookfair.auth.repository.UserRepository;
import com.bookfair.auth.repository.EmployeeRepository;
import com.bookfair.auth.repository.VendorRepository;
import com.bookfair.common.exception.AccountDisabledException;
import com.bookfair.common.exception.EmailAlreadyExistsException;
import com.bookfair.common.exception.InvalidCredentialsException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.*;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final VendorRepository vendorRepository;
    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    /**
     * Registers a new Vendor user and returns AuthResponse with JWT.
     */
    @Transactional
    public AuthResponse registerVendor(RegisterRequest req) {
        log.info("Registering new vendor: {}", req.getEmail());

        if (userRepository.existsByEmail(req.getEmail())) {
            throw new EmailAlreadyExistsException("Email already registered: " + req.getEmail());
        }

        User user = User.builder()
                .email(req.getEmail().toLowerCase().trim())
                .password(passwordEncoder.encode(req.getPassword()))
                .role(Role.VENDOR)
                .isActive(true)
                .build();
        user = userRepository.save(user);

        // create vendor profile
        Vendor vendor = Vendor.builder()
                .user(user)
                .businessName(req.getBusinessName())
                .phone(req.getContactNumber())
                .address(req.getAddress())
                .build();
        vendorRepository.save(vendor);

        String token = jwtService.generateToken(user, vendor.getId(), null);
        long expiresIn = calculateExpirySeconds(token);

        UserProfileResponse profile = mapToProfile(user);
        return AuthResponse.builder()
                .accessToken(token)
                .expiresIn(expiresIn)
                .user(profile)
                .build();
    }


    public AuthResponse login(AuthRequest req) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword())
            );
        } catch (BadCredentialsException ex) {
            throw new InvalidCredentialsException("Invalid email or password");
        } catch (DisabledException ex) {
            throw new AccountDisabledException("Account is disabled");
        }

        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        Long vendorId = null;
        Long employeeId = null;
        if (user.getRole() == Role.VENDOR) {
            vendorId = vendorRepository.findByUserId(user.getId()).map(v -> v.getId()).orElse(null);
        } else if (user.getRole() == Role.EMPLOYEE) {
            employeeId = employeeRepository.findByUserId(user.getId()).map(e -> e.getId()).orElse(null);
        }

        String token = jwtService.generateToken(user, vendorId, employeeId);
        long expiresIn = calculateExpirySeconds(token);

        return AuthResponse.builder()
                .accessToken(token)
                .expiresIn(expiresIn)
                .build();
    }

    /**
     * Safely calculates token expiry seconds remaining.
     */
    private long calculateExpirySeconds(String token) {
        Object expClaim = jwtService.extractAllClaims(token).get("exp");
        if (expClaim instanceof Number expNum) {
            return expNum.longValue() - Instant.now().getEpochSecond();
        }
        return 0L;
    }

    private UserProfileResponse mapToProfile(User user) {
        UserProfileResponse.UserProfileResponseBuilder b = UserProfileResponse.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .role(user.getRole().name())
                .isActive(user.getIsActive());

        if (user.getRole() == Role.VENDOR) {
            vendorRepository.findByUserId(user.getId()).ifPresent(v -> {
                b.businessName(v.getBusinessName());
                b.phone(v.getPhone());
                b.address(v.getAddress());
            });
        } else if (user.getRole() == Role.EMPLOYEE) {
            employeeRepository.findByUserId(user.getId()).ifPresent(e -> {
                b.fullName(e.getFullName());
                b.department(e.getDepartment());
                b.phone(e.getPhone());
            });
        }
        return b.build();
    }
}
