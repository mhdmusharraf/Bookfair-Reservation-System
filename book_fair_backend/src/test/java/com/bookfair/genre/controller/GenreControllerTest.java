package com.bookfair.genre.controller;

import com.bookfair.auth.entity.User;
import com.bookfair.auth.service.UserService;
import com.bookfair.genre.dto.GenreRequest;
import com.bookfair.genre.dto.GenreResponse;
import com.bookfair.genre.service.GenreService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GenreControllerTest {

    @Mock
    private GenreService genreService;

    @Mock
    private UserService userService;

    @InjectMocks
    private GenreController controller;

    @Test
    void addGenre_returnsCreatedGenre() {
        GenreRequest req = new GenreRequest();
        req.setName("Fantasy");

        User user = User.builder().id(5L).email("v@vendor.com").build();
        when(userService.getCurrentUser()).thenReturn(user);

        GenreResponse resp = GenreResponse.builder().id(1L).name("Fantasy").build();
        when(genreService.addGenre(eq(req), eq(user))).thenReturn(resp);

        ResponseEntity<GenreResponse> result = controller.addGenre(req);

        assertThat(result.getStatusCodeValue()).isEqualTo(200);
        assertThat(result.getBody()).isEqualTo(resp);
    }

    @Test
    void getGenres_returnsListForUser() {
        User user = User.builder().id(6L).email("v2@vendor.com").build();
        when(userService.getCurrentUser()).thenReturn(user);

        GenreResponse g1 = GenreResponse.builder().id(10L).name("Sci-Fi").build();
        GenreResponse g2 = GenreResponse.builder().id(11L).name("Mystery").build();
        when(genreService.getGenresForUser(eq(user))).thenReturn(List.of(g1, g2));

        ResponseEntity<List<GenreResponse>> resp = controller.getGenres();

        assertThat(resp.getStatusCodeValue()).isEqualTo(200);
        assertThat(resp.getBody()).containsExactly(g1, g2);
    }

    @Test
    void deleteGenre_invokesServiceAndReturnsNoContent() {
        User user = User.builder().id(7L).email("v3@vendor.com").build();
        when(userService.getCurrentUser()).thenReturn(user);

        Long id = 42L;

        doNothing().when(genreService).removeGenre(eq(id), eq(user));

        ResponseEntity<Void> resp = controller.deleteGenre(id);

        assertThat(resp.getStatusCodeValue()).isEqualTo(204);
        verify(genreService, times(1)).removeGenre(eq(id), eq(user));
    }
}