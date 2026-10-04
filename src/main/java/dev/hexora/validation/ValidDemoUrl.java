package dev.hexora.validation;
import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.*;
@Documented @Constraint(validatedBy=DemoUrlValidator.class) @Target({ElementType.FIELD,ElementType.PARAMETER}) @Retention(RetentionPolicy.RUNTIME)
public @interface ValidDemoUrl {
 String message() default "Invalid demo URL";
 Class<?>[] groups() default {};
 Class<? extends Payload>[] payload() default {};
}
