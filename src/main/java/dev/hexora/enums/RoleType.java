package dev.hexora.enums;

public enum RoleType {
    ADMIN("ادمین"),
    USER("کاربر"),
    EDITOR("ویرایشگر"),
    VIEWER("بیننده");

    private final String persianName;

    RoleType(String persianName) {
        this.persianName = persianName;
    }

    public String getPersianName() {
        return persianName;
    }

    public static RoleType fromString(String value) {
        for (RoleType role : RoleType.values()) {
            if (role.name().equalsIgnoreCase(value) || role.getPersianName().equals(value)) {
                return role;
            }
        }
        throw new IllegalArgumentException("Invalid role: " + value);
    }

    public static boolean isValid(String value) {
        for (RoleType role : RoleType.values()) {
            if (role.name().equalsIgnoreCase(value) || role.getPersianName().equals(value)) {
                return true;
            }
        }
        return false;
    }
}