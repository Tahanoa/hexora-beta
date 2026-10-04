package dev.hexora.dto.response;

import java.time.LocalDateTime;

public class ServiceResponse {

    private Long id;
    private String title;
    private String description;
    private String icon;
    private String features;
    private Integer order;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

 private String slug;
 private String shortDescription;
 private String cover;
 private String audience;
 private String scope;
 private String exclusions;
 private String duration;
 private String pricingMode;
 private String priceLabel;
 private String support;
 private String revisions;
 private Boolean published;
 private Boolean featured;
 private java.util.List<String> deliverables;
 private java.util.List<Long> relatedProjectIds;
 private java.util.List<dev.hexora.model.ServiceFaq> faqs;
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
