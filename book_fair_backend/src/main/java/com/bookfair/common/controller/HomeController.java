package com.bookfair.common.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class HomeController {

    @GetMapping("/")
    public ResponseEntity<Map<String, String>> welcome() {
        return ResponseEntity.ok(Map.of(
                "message", "Book Fair Reservation System backend is running"
        ));
    }
}