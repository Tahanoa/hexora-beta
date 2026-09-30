package dev.hexora.dto.request;

import jakarta.validation.constraints.*;
import dev.hexora.enums.SkillCategory;

public class SkillRequest {

    @NotBlank(message = "Skill name is required")
    @Size(min = 2, max = 50, message = "Skill name must be between 2 and 50 characters")
    private String name;

    @NotNull(message = "Category is required")
    private SkillCategory category;

    @NotNull(message = "Level is required")
    @Min(value = 0, message = "Level must be at least 0")
    @Max(value = 100, message = "Level must be at most 100")
    private Integer level;

    @Size(max = 255, message = "Icon must be less than 255 characters")
    private String icon;

    @Size(max = 500, message = "Description must be less than 500 characters")
    private String description;

    // Getters and Setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public SkillCategory getCategory() {
        return category;
    }

    public void setCategory(SkillCategory category) {
        this.category = category;
    }

    public Integer getLevel() {
        return level;
    }

    public void setLevel(Integer level) {
        this.level = level;
    }

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}