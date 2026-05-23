package com.financeapp.finance_backend.dto;
import lombok.Data;
@Data public class RegisterRequest {
    private String name;
    private String email;
    private String password;
}