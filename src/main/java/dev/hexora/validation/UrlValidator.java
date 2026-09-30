package dev.hexora.validation;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import java.net.URI;
public class UrlValidator implements ConstraintValidator<ValidUrl, String> {
 public boolean isValid(String value, ConstraintValidatorContext context) {
  if (value == null || value.isBlank()) return true;
  try { URI uri = URI.create(value); return ("http".equalsIgnoreCase(uri.getScheme()) || "https".equalsIgnoreCase(uri.getScheme())) && uri.getHost() != null && uri.getUserInfo() == null; }
  catch (IllegalArgumentException ex) { return false; }
 }
}
