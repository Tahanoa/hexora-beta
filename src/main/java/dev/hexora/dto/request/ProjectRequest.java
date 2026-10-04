package dev.hexora.dto.request;

import jakarta.validation.constraints.*;
import dev.hexora.enums.ProjectStatus;
import dev.hexora.validation.ValidUrl;
import java.time.LocalDateTime;

public class ProjectRequest {

    @NotBlank(message = "Title is required")
    @Size(min = 3, max = 100, message = "Title must be between 3 and 100 characters")
    private String title;

    @NotBlank(message = "Slug is required")
    @Pattern(regexp = "^[a-z0-9]+(?:-[a-z0-9]+)*$",
            message = "Slug must contain only lowercase letters, numbers, and hyphens")
    @Size(max = 100, message = "Slug must be less than 100 characters")
    private String slug;

    @Size(max = 500, message = "Short description must be less than 500 characters")
    private String shortDescription;

    @Size(max = 10000, message = "Description must be less than 10000 characters")
    private String description;

    @Size(max = 255, message = "Image path must be less than 255 characters")
    private String image;

    @dev.hexora.validation.ValidDemoUrl
    @Size(max = 255, message = "Demo URL must be less than 255 characters")
    private String demoUrl;

    @ValidUrl
    @Size(max = 255, message = "GitHub URL must be less than 255 characters")
    private String githubUrl;

    @Size(max = 100, message = "Client name must be less than 100 characters")
    private String clientName;

    @NotNull(message = "Status is required")
    private ProjectStatus status;

    @PastOrPresent(message = "Project date cannot be in the future")
    private LocalDateTime projectDate;

    public @NotBlank(message = "Title is required") @Size(min = 3, max = 100, message = "Title must be between 3 and 100 characters") String getTitle() {
        return title;
    }

    public void setTitle(@NotBlank(message = "Title is required") @Size(min = 3, max = 100, message = "Title must be between 3 and 100 characters") String title) {
        this.title = title;
    }

    public @NotBlank(message = "Slug is required") @Pattern(regexp = "^[a-z0-9]+(?:-[a-z0-9]+)*$",
            message = "Slug must contain only lowercase letters, numbers, and hyphens") @Size(max = 100, message = "Slug must be less than 100 characters") String getSlug() {
        return slug;
    }

    public void setSlug(@NotBlank(message = "Slug is required") @Pattern(regexp = "^[a-z0-9]+(?:-[a-z0-9]+)*$",
            message = "Slug must contain only lowercase letters, numbers, and hyphens") @Size(max = 100, message = "Slug must be less than 100 characters") String slug) {
        this.slug = slug;
    }

    public @Size(max = 500, message = "Short description must be less than 500 characters") String getShortDescription() {
        return shortDescription;
    }

    public void setShortDescription(@Size(max = 500, message = "Short description must be less than 500 characters") String shortDescription) {
        this.shortDescription = shortDescription;
    }

    public @Size(max = 10000, message = "Description must be less than 10000 characters") String getDescription() {
        return description;
    }

    public void setDescription(@Size(max = 10000, message = "Description must be less than 10000 characters") String description) {
        this.description = description;
    }

    public @Size(max = 255, message = "Image path must be less than 255 characters") String getImage() {
        return image;
    }

    public void setImage(@Size(max = 255, message = "Image path must be less than 255 characters") String image) {
        this.image = image;
    }

    public @Size(max = 255, message = "Demo URL must be less than 255 characters") String getDemoUrl() {
        return demoUrl;
    }

    public void setDemoUrl(@Size(max = 255, message = "Demo URL must be less than 255 characters") String demoUrl) {
        this.demoUrl = demoUrl;
    }

    public @Size(max = 255, message = "GitHub URL must be less than 255 characters") String getGithubUrl() {
        return githubUrl;
    }

    public void setGithubUrl(@Size(max = 255, message = "GitHub URL must be less than 255 characters") String githubUrl) {
        this.githubUrl = githubUrl;
    }

    public @Size(max = 100, message = "Client name must be less than 100 characters") String getClientName() {
        return clientName;
    }

    public void setClientName(@Size(max = 100, message = "Client name must be less than 100 characters") String clientName) {
        this.clientName = clientName;
    }

    public @NotNull(message = "Status is required") ProjectStatus getStatus() {
        return status;
    }

    public void setStatus(@NotNull(message = "Status is required") ProjectStatus status) {
        this.status = status;
    }

    public @PastOrPresent(message = "Project date cannot be in the future") LocalDateTime getProjectDate() {
        return projectDate;
    }

    public void setProjectDate(@PastOrPresent(message = "Project date cannot be in the future") LocalDateTime projectDate) {
        this.projectDate = projectDate;
    }
}