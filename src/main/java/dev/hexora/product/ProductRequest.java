package dev.hexora.product;
import jakarta.validation.constraints.*;
public record ProductRequest(
 @NotBlank @Pattern(regexp="[a-z0-9]+(?:-[a-z0-9]+)*") @Size(max=80) String slug,
 @NotBlank @Size(max=150) String title,@Size(max=150) String titleEn,
 @Size(max=20000) String description,@Size(max=20000) String descriptionEn,
 @Size(max=80) String category,@Size(max=10000) String requirements,
 @Size(max=500) String demoUrl,Long coverId,
 @Min(0) @Max(1000000000) long price,boolean published) {}
