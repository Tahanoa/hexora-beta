package dev.hexora.dto.request;

import jakarta.validation.constraints.*;

public class StatisticRequest {

    @NotBlank(message = "Title is required")
    @Size(min = 2, max = 100, message = "Title must be between 2 and 100 characters")
    private String title;

    @NotBlank(message = "Value is required")
    @Size(max = 50, message = "Value must be less than 50 characters")
    private String value;

    @Size(max = 255, message = "Icon must be less than 255 characters")
    private String icon;

    @Min(value = 0, message = "Order must be at least 0")
    private Integer order;

    // Getters and Setters
    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }

    public Integer getOrder() {
        return order;
    }

    public void setOrder(Integer order) {
        this.order = order;
    }
}