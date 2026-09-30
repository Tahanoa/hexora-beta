package dev.hexora.enums;

public enum ProjectStatus {
    COMPLETED("تکمیل شده", "#00C26E"),
    IN_PROGRESS("در حال انجام", "#FBBF24"),
    PLANNING("برنامه‌ریزی شده", "#8A94A6"),
    ON_HOLD("متوقف شده", "#EF4444"),
    CANCELLED("لغو شده", "#6B7280");

    private final String persianName;
    private final String color;

    ProjectStatus(String persianName, String color) {
        this.persianName = persianName;
        this.color = color;
    }

    public String getPersianName() {
        return persianName;
    }

    public String getColor() {
        return color;
    }

    public static ProjectStatus fromString(String value) {
        for (ProjectStatus status : ProjectStatus.values()) {
            if (status.name().equalsIgnoreCase(value) || status.getPersianName().equals(value)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Invalid project status");
    }

    public static boolean isValid(String value) {
        for (ProjectStatus status : ProjectStatus.values()) {
            if (status.name().equalsIgnoreCase(value) || status.getPersianName().equals(value)) {
                return true;
            }
        }
        return false;
    }
}