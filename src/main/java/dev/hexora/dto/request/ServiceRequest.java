package dev.hexora.dto.request;

import jakarta.validation.constraints.*;

public class ServiceRequest {

    @NotBlank(message = "Service title is required")
    @Size(min = 3, max = 100, message = "Title must be between 3 and 100 characters")
    private String title;

    @Size(max = 5000, message = "Description must be less than 5000 characters")
    private String description;

    @Size(max = 255, message = "Icon must be less than 255 characters")
    private String icon;

    @Size(max = 1000, message = "Features must be less than 1000 characters")
    private String features;

    @Min(value = 0, message = "Order must be at least 0")
    private Integer order;

    // Getters and Setters
    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }

    public String getFeatures() {
        return features;
    }

    public void setFeatures(String features) {
        this.features = features;
    }

    public Integer getOrder() {
        return order;
    }

    public void setOrder(Integer order) {
        this.order = order;
    }
}