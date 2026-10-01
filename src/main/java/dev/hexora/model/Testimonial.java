package dev.hexora.model;
import jakarta.persistence.*;
@Entity @Table(name="testimonials")
public class Testimonial extends BaseEntity {
 @Column(nullable=false) private String authorName;
  private String role;
  private String company;
  private String projectTitle;
 @Column(nullable=false,columnDefinition="TEXT") private String quote;
  private String avatar;
  private String sourceUrl;
  private Integer rating;
 @Column(name="display_order") private Integer order;
 @Column(nullable=false) private boolean published;
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
