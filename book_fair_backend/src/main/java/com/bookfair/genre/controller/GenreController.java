package com.bookfair.genre.controller;

import com.bookfair.auth.entity.User;
import com.bookfair.auth.service.UserService;
import com.bookfair.genre.dto.GenreRequest;
import com.bookfair.genre.dto.GenreResponse;
import com.bookfair.genre.service.GenreService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
@Tag(name = "Genres")
@RequestMapping("/api/v1/genres")
public class GenreController {

    private final GenreService genreService;
    private final UserService userService;

    @PostMapping
    @PreAuthorize("hasRole('VENDOR')")
    @Operation(summary = "Add a genre for the authenticated vendor")
    public ResponseEntity<GenreResponse> addGenre(@Valid @RequestBody GenreRequest request) {
        User user = userService.getCurrentUser();
        return ResponseEntity.ok(genreService.addGenre(request, user));
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('VENDOR')")
    @Operation(summary = "List genres for the authenticated vendor")
    public ResponseEntity<List<GenreResponse>> getGenres() {
        User user = userService.getCurrentUser();
        return ResponseEntity.ok(genreService.getGenresForUser(user));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('VENDOR')")
    @Operation(summary = "Remove a genre")
    public ResponseEntity<Void> deleteGenre(@PathVariable Long id) {
        User user = userService.getCurrentUser();
        genreService.removeGenre(id, user);
        return ResponseEntity.noContent().build();
    }
}

