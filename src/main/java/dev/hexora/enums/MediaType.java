package dev.hexora.enums;

public enum MediaType {
    IMAGE("تصویر", "image"),
    DOCUMENT("سند", "document"),
    VIDEO("ویدئو", "video"),
    AUDIO("صدا", "audio"),
    OTHER("سایر", "other");

    private final String persianName;
    private final String type;

    MediaType(String persianName, String type) {
        this.persianName = persianName;
        this.type = type;
    }

    public String getPersianName() {
        return persianName;
    }

    public String getType() {
        return type;
    }

    public static MediaType fromString(String value) {
        if (value == null) {
            return OTHER;
        }

        // Check by name
        for (MediaType mediaType : MediaType.values()) {
            if (mediaType.name().equalsIgnoreCase(value)) {
                return mediaType;
            }
        }

        // Check by persian name
        for (MediaType mediaType : MediaType.values()) {
            if (mediaType.getPersianName().equals(value)) {
                return mediaType;
            }
        }

        // Check by type string
        for (MediaType mediaType : MediaType.values()) {
            if (mediaType.getType().equalsIgnoreCase(value)) {
                return mediaType;
            }
        }

        return OTHER;
    }

    public static boolean isValid(String value) {
        for (MediaType mediaType : MediaType.values()) {
            if (mediaType.name().equalsIgnoreCase(value) ||
                    mediaType.getPersianName().equals(value) ||
                    mediaType.getType().equalsIgnoreCase(value)) {
                return true;
            }
        }
        return false;
    }
}