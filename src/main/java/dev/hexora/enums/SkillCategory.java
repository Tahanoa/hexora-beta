package dev.hexora.enums;

public enum SkillCategory {
    BACKEND("بک‌اند", "#00C26E"),
    FRONTEND("فرانت‌اند", "#4DFFB8"),
    DATABASE("پایگاه داده", "#FBBF24"),
    DEVOPS("دواپس", "#EF4444"),
    TOOLS("ابزارها", "#8B5CF6"),
    MOBILE("موبایل", "#EC4899"),
    OTHER("سایر", "#8A94A6");

    private final String persianName;
    private final String color;

    SkillCategory(String persianName, String color) {
        this.persianName = persianName;
        this.color = color;
    }

    public String getPersianName() {
        return persianName;
    }

    public String getColor() {
        return color;
    }

    public static SkillCategory fromString(String value) {
        for (SkillCategory category : SkillCategory.values()) {
            if (category.name().equalsIgnoreCase(value) || category.getPersianName().equals(value)) {
                return category;
            }
        }
        return OTHER;
    }

    public static boolean isValid(String value) {
        for (SkillCategory category : SkillCategory.values()) {
            if (category.name().equalsIgnoreCase(value) || category.getPersianName().equals(value)) {
                return true;
            }
        }
        return false;
    }
}