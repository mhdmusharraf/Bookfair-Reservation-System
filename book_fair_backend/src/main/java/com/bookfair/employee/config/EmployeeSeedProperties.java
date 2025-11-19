package com.bookfair.employee.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.ArrayList;
import java.util.List;

@Data
@ConfigurationProperties(prefix = "bookfair.employee-seed")
public class EmployeeSeedProperties {

    private boolean enabled = false;
    private List<EmployeeAccount> accounts = new ArrayList<>();

    @Data
    public static class EmployeeAccount {
        private String businessName;
        private String contactNumber;
        private String email;
        private String password;
    }
}
