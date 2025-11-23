package com.bookfair.auth.config;

import io.swagger.v3.oas.models.ExternalDocumentation;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI bookFairOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Book Fair Reservation System API")
                        .description("REST API documentation for Colombo International Book Fair stall reservation system.")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Backend Team - Book Fair Project")
                                .email("backend.team@bookfair.lk")
                                .url("https://github.com/BookFairProject"))
                        .license(new License()
                                .name("Apache 2.0")
                                .url("https://springdoc.org")))
                .servers(List.of(
                        new Server().url("http://localhost:8081").description("Local Development Server")
                ))
                .externalDocs(new ExternalDocumentation()
                        .description("Book Fair API GitHub Repository")
                        .url("https://github.com/BookFairProject/backend"));
    }
}
