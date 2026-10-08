package dev.hexora.payment;
import jakarta.validation.constraints.*;
public record PaymentConsentRequest(@AssertTrue boolean accepted,@NotBlank @Size(max=32) String termsVersion) {}
