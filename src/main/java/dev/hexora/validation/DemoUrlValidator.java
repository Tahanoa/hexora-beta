package dev.hexora.validation;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
public class DemoUrlValidator implements ConstraintValidator<ValidDemoUrl,String>{
 public boolean isValid(String value,ConstraintValidatorContext context){return value!=null&&value.matches("/demo-sites/[a-z][a-z0-9]*(?:-[a-z0-9]+)*/")||new UrlValidator().isValid(value,context);}
}
