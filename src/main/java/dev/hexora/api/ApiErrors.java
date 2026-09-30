package dev.hexora.api;
import dev.hexora.dto.response.ApiResponse;
import jakarta.validation.ConstraintViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.*;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import java.util.*;
@RestControllerAdvice
public class ApiErrors {
 private static final Logger log = LoggerFactory.getLogger(ApiErrors.class);
 @ExceptionHandler(ApiException.class) ResponseEntity<?> known(ApiException ex) { return error(ex.status(), ex.getMessage()); }
 @ExceptionHandler(MethodArgumentNotValidException.class) ResponseEntity<?> validation(MethodArgumentNotValidException ex) {
  Map<String,String> errors = new LinkedHashMap<>();
  ex.getBindingResult().getFieldErrors().forEach(e -> errors.put(e.getField(), e.getDefaultMessage()));
  return ResponseEntity.badRequest().body(ApiResponse.error("Invalid input", errors));
 }
 @ExceptionHandler({IllegalArgumentException.class, ConstraintViolationException.class, MethodArgumentTypeMismatchException.class, HttpMessageNotReadableException.class})
 ResponseEntity<?> input(Exception ex) { return error(HttpStatus.BAD_REQUEST, "Invalid request data"); }
 @ExceptionHandler(DataIntegrityViolationException.class) ResponseEntity<?> conflict() { return error(HttpStatus.CONFLICT, "Duplicate value or resource is still in use"); }
 @ExceptionHandler(AuthenticationException.class) ResponseEntity<?> auth() { return error(HttpStatus.UNAUTHORIZED, "Invalid credentials or account disabled"); }
 @ExceptionHandler(AccessDeniedException.class) ResponseEntity<?> access() { return error(HttpStatus.FORBIDDEN, "Access denied"); }
 @ExceptionHandler(MaxUploadSizeExceededException.class) ResponseEntity<?> size() { return error(HttpStatus.PAYLOAD_TOO_LARGE, "Maximum upload size is 5 MB"); }
 @ExceptionHandler(Exception.class) ResponseEntity<?> unexpected(Exception ex) { log.error("Unhandled request failure", ex); return error(HttpStatus.INTERNAL_SERVER_ERROR, "Unexpected server error"); }
 private ResponseEntity<?> error(HttpStatus status, String message) { return ResponseEntity.status(status).body(ApiResponse.error(message,status.value())); }
}
