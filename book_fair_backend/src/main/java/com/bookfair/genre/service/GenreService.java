package com.bookfair.genre.service;

import com.bookfair.auth.entity.User;
import com.bookfair.genre.dto.GenreRequest;
import com.bookfair.genre.dto.GenreResponse;
import com.bookfair.genre.entity.Genre;
import com.bookfair.genre.repository.GenreRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class GenreService {

    private final GenreRepository genreRepository;

    @Transactional
    public GenreResponse addGenre(GenreRequest request, User user) {
        boolean exists = genreRepository.findByUser(user).stream()
                .anyMatch(genre -> genre.getName().equalsIgnoreCase(request.getName()));
        if (exists) {
            throw new IllegalArgumentException("Genre already added");
        }

        Genre genre = Genre.builder()
                .name(request.getName())
                .user(user)
                .build();
        Genre saved = genreRepository.save(genre);
        return toResponse(saved);
    }

    public List<GenreResponse> getGenresForUser(User user) {
        return genreRepository.findByUser(user).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public void removeGenre(Long id, User user) {
        Genre genre = genreRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Genre not found"));
        if (!genre.getUser().getId().equals(user.getId())) {
            throw new IllegalStateException("Cannot delete a genre that does not belong to the user");
        }
        genreRepository.delete(genre);
    }

    private GenreResponse toResponse(Genre genre) {
        return GenreResponse.builder()
                .id(genre.getId())
                .name(genre.getName())
                .build();
    }
}

