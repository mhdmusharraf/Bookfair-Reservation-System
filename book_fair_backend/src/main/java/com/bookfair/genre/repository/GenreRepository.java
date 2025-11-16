package com.bookfair.genre.repository;

import com.bookfair.auth.entity.User;
import com.bookfair.genre.entity.Genre;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GenreRepository extends JpaRepository<Genre, Long> {

    List<Genre> findByUser(User user);
}

