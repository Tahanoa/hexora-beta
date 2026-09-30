package dev.hexora.security;
import jakarta.validation.constraints.*;
public record RegisterRequest(@NotBlank @Size(min=3,max=50) String username,@NotBlank @Email @Size(max=150) String email,@NotBlank @Size(min=8,max=100) String password){}
