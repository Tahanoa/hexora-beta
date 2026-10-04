package dev.hexora.dto.request;

import jakarta.validation.constraints.*;
import dev.hexora.model.ServiceFaq;

public class ServiceRequest {

    @NotBlank(message = "Service title is required")
    @Size(min = 3, max = 100, message = "Title must be between 3 and 100 characters")
    private String title;

    @Size(max = 5000, message = "Description must be less than 5000 characters")
    private String description;

    @Size(max = 255, message = "Icon must be less than 255 characters")
    private String icon;

    @Size(max = 40000, message = "Features must be less than 40000 characters")
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

 @Size(max=100) @Pattern(regexp="^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$",message="Use a lowercase English slug starting with a letter")
 private String slug;
 @Size(max=500)
 private String shortDescription;
 @Size(max=2000) @Pattern(regexp="^(?:https?://[^\\s]+|/api/media/public/[0-9]+)$",message="Use an image URL or a media image")
 private String cover;
 @Size(max=10000)
 private String audience;
 @Size(max=10000)
 private String scope;
 @Size(max=10000)
 private String exclusions;
 @Size(max=10000)
 private String duration;
 @Pattern(regexp="QUOTE|FROM|RANGE")
 private String pricingMode;
 @Size(max=10000)
 private String priceLabel;
 @Size(max=10000)
 private String support;
 @Size(max=10000)
 private String revisions;
 private Boolean published = false;
 private Boolean featured = false;
 @Size(max=30)
 private java.util.List<@NotBlank @Size(max=1000) String> deliverables = new java.util.ArrayList<>();
 @Size(max=20)
 private java.util.List<@NotNull @Positive Long> relatedProjectIds = new java.util.ArrayList<>();
 @jakarta.validation.Valid @Size(max=20)
 private java.util.List<@NotNull ServiceFaq> faqs = new java.util.ArrayList<>();
 public String getSlug(){return slug;} public void setSlug(String value){slug=value;}
 public String getShortDescription(){return shortDescription;} public void setShortDescription(String value){shortDescription=value;}
 public String getCover(){return cover;} public void setCover(String value){cover=value;}
 public String getAudience(){return audience;} public void setAudience(String value){audience=value;}
 public String getScope(){return scope;} public void setScope(String value){scope=value;}
 public String getExclusions(){return exclusions;} public void setExclusions(String value){exclusions=value;}
 public String getDuration(){return duration;} public void setDuration(String value){duration=value;}
 public String getPricingMode(){return pricingMode;} public void setPricingMode(String value){pricingMode=value;}
 public String getPriceLabel(){return priceLabel;} public void setPriceLabel(String value){priceLabel=value;}
 public String getSupport(){return support;} public void setSupport(String value){support=value;}
 public String getRevisions(){return revisions;} public void setRevisions(String value){revisions=value;}
 public Boolean getPublished(){return published;} public void setPublished(Boolean value){published=value;}
 public Boolean getFeatured(){return featured;} public void setFeatured(Boolean value){featured=value;}
 public java.util.List<String> getDeliverables(){return deliverables;} public void setDeliverables(java.util.List<String> value){deliverables=value;}
 public java.util.List<Long> getRelatedProjectIds(){return relatedProjectIds;} public void setRelatedProjectIds(java.util.List<Long> value){relatedProjectIds=value;}
 public java.util.List<dev.hexora.model.ServiceFaq> getFaqs(){return faqs;} public void setFaqs(java.util.List<dev.hexora.model.ServiceFaq> value){faqs=value;}
}
