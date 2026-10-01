package dev.hexora.dto.request;
import jakarta.validation.constraints.*;
import dev.hexora.validation.ValidUrl;
public class TestimonialRequest {
 @NotBlank @Size(max=100) private String authorName;
 @Size(max=120) private String role;
 @Size(max=150) private String company;
 @Size(max=150) private String projectTitle;
 @NotBlank @Size(max=3000) private String quote;
 @Size(max=255) private String avatar;
 @ValidUrl @Size(max=255) private String sourceUrl;
 @Min(1) @Max(5) private Integer rating;
 @Min(0) private Integer order;
  private boolean published;
 public String getAuthorName(){return authorName;}
 public void setAuthorName(String value){this.authorName=value;}
 public String getRole(){return role;}
 public void setRole(String value){this.role=value;}
 public String getCompany(){return company;}
 public void setCompany(String value){this.company=value;}
 public String getProjectTitle(){return projectTitle;}
 public void setProjectTitle(String value){this.projectTitle=value;}
 public String getQuote(){return quote;}
 public void setQuote(String value){this.quote=value;}
 public String getAvatar(){return avatar;}
 public void setAvatar(String value){this.avatar=value;}
 public String getSourceUrl(){return sourceUrl;}
 public void setSourceUrl(String value){this.sourceUrl=value;}
 public Integer getRating(){return rating;}
 public void setRating(Integer value){this.rating=value;}
 public Integer getOrder(){return order;}
 public void setOrder(Integer value){this.order=value;}
 public boolean getPublished(){return published;}
 public void setPublished(boolean value){this.published=value;}
}
