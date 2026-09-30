package dev.hexora.enums;

public enum WorkingStatus {
    AVAILABLE("در دسترس", "#00C26E"),
    BUSY("مشغول", "#FBBF24"),
    NOT_AVAILABLE("در دسترس نیست", "#EF4444"),
    REMOTE("دورکاری", "#4DFFB8");

    private final String persianName;
    private final String color;

    WorkingStatus(String persianName, String color) {
        this.persianName = persianName;
        this.color = color;
    }

    public String getPersianName() {
        return persianName;
    }

    public String getColor() {
        return color;
    }

    public static WorkingStatus fromString(String value) {
        for (WorkingStatus status : WorkingStatus.values()) {
            if (status.name().equalsIgnoreCase(value) || status.getPersianName().equals(value)) {
                return status;
            }
        }
        return AVAILABLE;
    }
}