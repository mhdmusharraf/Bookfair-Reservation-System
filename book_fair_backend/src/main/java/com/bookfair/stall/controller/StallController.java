package com.bookfair.stall.controller;

import com.bookfair.stall.dto.StallCollectionResponse;
import com.bookfair.stall.dto.StallRequest;
import com.bookfair.stall.dto.StallResponse;
import com.bookfair.stall.entity.StallSize;
import com.bookfair.stall.service.StallService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequiredArgsConstructor
@Tag(name = "Stalls")
@RequestMapping("/api/v1/stalls")
public class StallController {

    private final StallService stallService;

    @GetMapping
    @Operation(summary = "Retrieve stalls", description = "Optionally filter by availability and size")
    public ResponseEntity<StallCollectionResponse> getStalls(
            @Parameter(description = "Return only available stalls")
            @RequestParam(name = "availableOnly", defaultValue = "false") boolean availableOnly,
            @Parameter(description = "Filter by stall size")
            @RequestParam(name = "size", required = false) StallSize size) {
        return ResponseEntity.ok(stallService.getStalls(availableOnly, size));
    }

    @PostMapping
    @PreAuthorize("hasRole('EMPLOYEE') or hasRole('ADMIN')")
    @Operation(summary = "Create a new stall", description = "Employee portal operation")
    public ResponseEntity<StallResponse> createStall(@Valid @RequestBody StallRequest request) {
        return ResponseEntity.ok(stallService.createStall(request));
    }

    @PutMapping("/{id}/release")
    @PreAuthorize("hasRole('EMPLOYEE') or hasRole('ADMIN')")
    @Operation(summary = "Release a stall", description = "Marks a stall as available again")
    public ResponseEntity<StallResponse> releaseStall(@PathVariable Long id) {
        return ResponseEntity.ok(stallService.releaseStall(id));
    }
}

