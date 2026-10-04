package dev.hexora.model;
import jakarta.persistence.*;

@Entity
@Table(name = "services")
public class BusinessService extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String icon;

    @Column(columnDefinition = "TEXT")
    private String features; // Store as JSON or comma-separated

    @Column(name = "display_order")
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

 @Column(unique=true,length=100)
 private String slug;
 @Column(columnDefinition="TEXT")
 private String shortDescription;
 @Column(columnDefinition="TEXT")
 private String cover;
 @Column(columnDefinition="TEXT")
 private String audience;
 @Column(columnDefinition="TEXT")
 private String scope;
 @Column(columnDefinition="TEXT")
 private String exclusions;
 @Column(columnDefinition="TEXT")
 private String duration;
 @Column(columnDefinition="TEXT")
 private String pricingMode;
 @Column(columnDefinition="TEXT")
 private String priceLabel;
 @Column(columnDefinition="TEXT")
 private String support;
 @Column(columnDefinition="TEXT")
 private String revisions;
 private Boolean published;
 private Boolean featured;
 @ElementCollection @CollectionTable(name="service_deliverables", joinColumns=@JoinColumn(name="service_id")) @OrderColumn(name="item_order")
 @Column(name="item_value",columnDefinition="TEXT")
 private java.util.List<String> deliverables = new java.util.ArrayList<>();
 @ElementCollection @CollectionTable(name="service_relatedprojectids", joinColumns=@JoinColumn(name="service_id")) @OrderColumn(name="item_order")
 @Column(name="project_id")
 private java.util.List<Long> relatedProjectIds = new java.util.ArrayList<>();
 @ElementCollection @CollectionTable(name="service_faqs", joinColumns=@JoinColumn(name="service_id")) @OrderColumn(name="item_order")
 private java.util.List<dev.hexora.model.ServiceFaq> faqs = new java.util.ArrayList<>();
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
