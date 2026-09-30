package dev.hexora.dto.request;

import jakarta.validation.constraints.*;
import dev.hexora.validation.ValidUrl;

public class ProfileRequest {

    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 100, message = "Full name must be between 2 and 100 characters")
    private String fullName;

    @Size(max = 50, message = "Brand name must be less than 50 characters")
    private String brandName;

    @Size(max = 100, message = "Title must be less than 100 characters")
    private String title;

    @Size(max = 500, message = "Short description must be less than 500 characters")
    private String shortDescription;

    @Size(max = 5000, message = "Bio must be less than 5000 characters")
    private String bio;

    @Size(max = 5000, message = "About text must be less than 5000 characters")
    private String aboutText;

    @Size(max = 5000, message = "Journey text must be less than 5000 characters")
    private String journeyText;

    @Size(max = 255, message = "Profile image path must be less than 255 characters")
    private String profileImage;

    private Long avatarId; // ✅ اضافه کردن

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    @Size(max = 100, message = "Email must be less than 100 characters")
    private String email;

    @Pattern(regexp = "^(?:[+]?[0-9]{10,15})?$", message = "Invalid phone number format")
    @Size(max = 20, message = "Phone number must be less than 20 characters")
    private String phone;

    @Size(max = 100, message = "Location must be less than 100 characters")
    private String location;

    @ValidUrl
    @Size(max = 255, message = "URL must be less than 255 characters")
    private String githubUrl;

    @ValidUrl
    @Size(max = 255, message = "URL must be less than 255 characters")
    private String linkedinUrl;

    @ValidUrl
    @Size(max = 255, message = "URL must be less than 255 characters")
    private String instagramUrl;

    @Pattern(regexp = "(?i)^(available|busy|not_available|remote)$",
            message = "Working status must be: available, busy, not_available, or remote")
    private String workingStatus;

    // ===== Getters and Setters =====
    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getBrandName() {
        return brandName;
    }

    public void setBrandName(String brandName) {
        this.brandName = brandName;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getShortDescription() {
        return shortDescription;
    }

    public void setShortDescription(String shortDescription) {
        this.shortDescription = shortDescription;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public String getAboutText() {
        return aboutText;
    }

    public void setAboutText(String aboutText) {
        this.aboutText = aboutText;
    }

    public String getJourneyText() {
        return journeyText;
    }

    public void setJourneyText(String journeyText) {
        this.journeyText = journeyText;
    }

    public String getProfileImage() {
        return profileImage;
    }

    public void setProfileImage(String profileImage) {
        this.profileImage = profileImage;
    }

    public Long getAvatarId() {
        return avatarId;
    }

    public void setAvatarId(Long avatarId) {
        this.avatarId = avatarId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getGithubUrl() {
        return githubUrl;
    }

    public void setGithubUrl(String githubUrl) {
        this.githubUrl = githubUrl;
    }

    public String getLinkedinUrl() {
        return linkedinUrl;
    }

    public void setLinkedinUrl(String linkedinUrl) {
        this.linkedinUrl = linkedinUrl;
    }

    public String getInstagramUrl() {
        return instagramUrl;
    }

    public void setInstagramUrl(String instagramUrl) {
        this.instagramUrl = instagramUrl;
    }

    public String getWorkingStatus() {
        return workingStatus;
    }

    public void setWorkingStatus(String workingStatus) {
        this.workingStatus = workingStatus;
    }
}