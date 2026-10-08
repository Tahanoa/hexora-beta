package dev.hexora.security;
import jakarta.validation.constraints.*;
public record LoginRequest(@NotBlank @Size(max=150) String usernameOrEmail,@NotBlank @Size(max=100) String password){}
