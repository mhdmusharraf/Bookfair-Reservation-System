package com.bookfair;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@OpenAPIDefinition(info = @Info(title = "Bookfair Reservation API", version = "1.0", description = "REST API for the Colombo International Bookfair reservation system"))
@SpringBootApplication
public class BookFairApplication {

    public static void main(String[] args) {
        SpringApplication.run(BookFairApplication.class, args);
    }
}

