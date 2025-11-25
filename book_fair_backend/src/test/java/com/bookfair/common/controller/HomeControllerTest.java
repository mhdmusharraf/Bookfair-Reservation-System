package com.bookfair.common.controller;

import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class HomeControllerTest {

    @Test
    void welcome_returnsRunningMessage() {
        HomeController controller = new HomeController();

        ResponseEntity<Map<String, String>> resp = controller.welcome();

        assertThat(resp.getStatusCodeValue()).isEqualTo(200);
        Map<String, String> body = resp.getBody();
        assertThat(body).isNotNull();
        assertThat(body).containsKey("message");
        assertThat(body.get("message")).isEqualTo("Book Fair Reservation System backend is running");
    }
}
